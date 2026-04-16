import cv2
import easyocr
import json
import time
import os
from datetime import datetime
from ultralytics import YOLO

# Configurações do Sistema
VIDEO_STREAM_URL = 'http://localhost:5001/video_feed'
MEMORY_PATH = '/Users/samuel.oliveirabra/Documents/Hermes/agent/memory/plate_logs.json'
DETECT_INTERVAL = 1.0  # Analisar um frame a cada 1 segundo

class LPREngine:
    def __init__(self):
        print("🧠 Inicializando Motor de Visão Hermes LPR...")
        # Usando YOLOv8n (Nano) para máxima velocidade no M4
        self.model = YOLO('yolov8n.pt') 
        # Inicializa o leitor OCR (Focado para o padrão Mercosul/Brasil)
        self.reader = easyocr.Reader(['en'], gpu=True) 
        
        if not os.path.exists(MEMORY_PATH):
            with open(MEMORY_PATH, 'w') as f:
                json.dump([], f)

    def log_plate(self, plate_text, confidence):
        """Registra a placa detectada na memória do Hermes."""
        try:
            with open(MEMORY_PATH, 'r') as f:
                logs = json.load(f)
            
            # Evita duplicatas imediatas (não registra a mesma placa nos últimos 30 segundos)
            if logs and logs[-1]['plate'] == plate_text:
                last_time = datetime.strptime(logs[-1]['timestamp'], '%Y-%m-%d %H:%M:%S')
                if (datetime.now() - last_time).seconds < 30:
                    return

            new_log = {
                "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                "plate": plate_text,
                "confidence": f"{confidence:.2f}"
            }
            logs.append(new_log)
            
            # Mantém apenas os últimos 100 registros para economizar espaço
            logs = logs[-100:]
            
            with open(MEMORY_PATH, 'w') as f:
                json.dump(logs, f, indent=4)
            print(f"🚨 PLACA DETECTADA: {plate_text} (Confiança: {confidence:.2f})")
        except Exception as e:
            print(f"Erro ao registrar placa: {e}")

    def run(self):
        print(f"🛰️ Motor LPR Ativo. Monitorando: {VIDEO_STREAM_URL}")
        # Como o stream é MJPEG do nosso gateway, usamos o OpenCV para capturar
        cap = cv2.VideoCapture(VIDEO_STREAM_URL)
        
        last_analysis = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                print("⚠️ Sinal de vídeo perdido no LPR Engine. Reconectando...")
                time.sleep(5)
                cap = cv2.VideoCapture(VIDEO_STREAM_URL)
                continue

            current_time = time.time()
            if current_time - last_analysis > DETECT_INTERVAL:
                # 1. Detecta objetos no frame (Carros, Motos, Caminhões)
                results = self.model(frame, verbose=False, classes=[2, 3, 5, 7]) # COCO: car, motorcycle, bus, truck
                
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        # 2. Para cada veículo, tenta localizar a placa e ler
                        # Aqui poderíamos usar um modelo específico de placas, 
                        # mas vamos usar o OCR direto na região do veículo para simplificar esta v1
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        vehicle_crop = frame[y1:y2, x1:x2]
                        
                        # 3. OCR na região do veículo
                        ocr_results = self.reader.readtext(vehicle_crop)
                        for (bbox, text, prob) in ocr_results:
                            # Filtro simples para formato de placa (ex: ABC1234 ou ABC1D23)
                            text = text.upper().replace(" ", "")
                            if len(text) >= 7 and prob > 0.4:
                                self.log_plate(text, prob)
                
                last_analysis = current_time

if __name__ == "__main__":
    lpr = LPREngine()
    lpr.run()
