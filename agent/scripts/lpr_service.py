import cv2
import json
import time
import os
import numpy as np
from ultralytics import YOLO
import easyocr
import sys
from datetime import datetime
import requests
import re

# Configura\u00e7\u00f5es do Sistema
CAMERA_IP = '192.168.3.71'
ONVIF_PORT = 8899
LOG_PATH = '/Users/samuel.oliveirabra/Documents/Hermes/agent/memory/plate_logs.json'
RADAR_STATE_PATH = '/Users/samuel.oliveirabra/Documents/Hermes/agent/memory/radar_state.json'
RADAR_ACTIVE_PATH = '/Users/samuel.oliveirabra/Documents/Hermes/agent/memory/radar_active.json'
DEBUG_DIR = '/Users/samuel.oliveirabra/Documents/Hermes/agent/debug/crops'
MODEL_PATH = '/Users/samuel.oliveirabra/.gemini/antigravity/scratch/yolov8n.pt'

def get_dynamic_rtsp_url():
    url = f'http://{CAMERA_IP}:{ONVIF_PORT}/onvif/media_service'
    headers = {'Content-Type': 'application/soap+xml; charset=utf-8'}
    body = '<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"><s:Body><GetStreamUri xmlns="http://www.onvif.org/ver10/media/wsdl"><StreamSetup><Stream xmlns="http://www.onvif.org/ver10/schema">RTP-Unicast</Stream><Transport xmlns="http://www.onvif.org/ver10/schema"><Protocol>RTSP</Protocol></Transport></StreamSetup><ProfileToken>001</ProfileToken></GetStreamUri></s:Body></s:Envelope>'
    try:
        r = requests.post(url, data=body, headers=headers, timeout=5)
        if r.status_code == 200:
            start_tag = '<tt:Uri>'
            end_tag = '</tt:Uri>'
            content = r.text
            start_idx = content.find(start_tag) + len(start_tag)
            end_idx = content.find(end_tag)
            if start_idx != -1 and end_idx != -1:
                return content[start_idx:end_idx].replace('&amp;', '&')
    except: pass
    return None

class VehicleTracker:
    def __init__(self):
        self.next_id = 1
        self.active_vehicles = {} 

    def iou(self, boxA, boxB):
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[2], boxB[2])
        yB = min(boxA[3], boxB[3])
        interArea = max(0, xB - xA + 1) * max(0, yB - yA + 1)
        if interArea <= 0: return 0
        boxAArea = (boxA[2] - boxA[0] + 1) * (boxA[3] - boxA[1] + 1)
        boxBArea = (boxB[2] - boxB[0] + 1) * (boxB[3] - boxB[1] + 1)
        return interArea / float(boxAArea + boxBArea - interArea)

    def update(self, detections, frame_count):
        updated_vehicles = {}
        matched_ids = set()
        
        for det in detections:
            box, cls_name = det['box'], det['class']
            best_id = None
            best_iou = 0.3

            for v_id, data in self.active_vehicles.items():
                if v_id in matched_ids: continue
                score = self.iou(box, data['box'])
                if score > best_iou:
                    best_iou = score
                    best_id = v_id

            if best_id:
                v_data = self.active_vehicles[best_id]
                v_data['box'] = box
                v_data['last_seen'] = frame_count
                updated_vehicles[best_id] = v_data
                matched_ids.add(best_id)
            else:
                updated_vehicles[self.next_id] = {
                    'box': box, 'buffer': [], 'last_seen': frame_count, 
                    'class': cls_name, 'plate': None, 'ocr_done': False
                }
                self.next_id += 1
        
        # Check for expired vehicles
        expired_vehicles = {}
        for v_id, data in self.active_vehicles.items():
            if v_id not in updated_vehicles:
                if frame_count - data['last_seen'] > 15: # Expira ap\u00f3s 15 frames sumido
                    expired_vehicles[v_id] = data
                else:
                    updated_vehicles[v_id] = data
        
        self.active_vehicles = updated_vehicles
        return self.active_vehicles, expired_vehicles

class HermesForensic:
    def __init__(self):
        print("BRAIN Inicializando N\u00facleo Forense Hermes v3.1 (Exit-Trigger Edition)...")
        self.model = YOLO(MODEL_PATH)
        self.reader = easyocr.Reader(['pt', 'en'], gpu=True)
        self.tracker = VehicleTracker()
        self.session_memory = {} 
        self.plate_pattern = re.compile(r'[A-Z]{3}[0-9][A-Z0-9][0-9]{2}') 
        self.clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))

    def is_radar_active(self):
        """Verifica se o processamento deve estar ativo."""
        try:
            if os.path.exists(RADAR_ACTIVE_PATH):
                with open(RADAR_ACTIVE_PATH, 'r') as f:
                    return json.load(f).get("active", False)
        except: pass
        return False

    def is_valid_plate(self, text):
        # Remove caracteres n\u00e3o alfanum\u00e9ricos e limpa a string
        clean_text = "".join(c for c in text if c.isalnum()).upper()
        
        # Padr\u00e3o Mercosul: AAA0A11 ou Cinza: AAA0000
        # Aceitamos 7 caracteres que se aproximem do padr\u00e3o brasileiro
        if len(clean_text) == 7:
            # Verifica se os 3 primeiros s\u00e3o letras (Padr\u00e3o Brasil)
            if clean_text[:3].isalpha():
                return True, clean_text
        return False, clean_text

    def reconstruct_plate(self, buffer):
        if not buffer: return None
        h, w = buffer[0].shape[:2]
        aligned_frames = [cv2.resize(f, (w, h)) for f in buffer]
        stack = np.stack(aligned_frames, axis=0)
        median = np.median(stack, axis=0).astype(np.uint8)
        kernel = np.array([[0,-1,0], [-1,5,-1], [0,-1,0]]) # Sharpening mais suave
        sharpened = cv2.filter2D(median, -1, kernel)
        return sharpened

    def log_plate(self, plate_text, confidence):
        valid, formatted_text = self.is_valid_plate(plate_text)
        if not valid: return False
        
        now = datetime.now()
        if formatted_text in self.session_memory:
            if (now - self.session_memory[formatted_text]).total_seconds() < 300: return False

        self.session_memory[formatted_text] = now
        new_entry = {"plate": formatted_text, "confidence": float(confidence), "timestamp": now.strftime("%Y-%m-%d %H:%M:%S")}
        try:
            logs = []
            if os.path.exists(LOG_PATH):
                with open(LOG_PATH, 'r') as f:
                    try: logs = json.load(f)
                    except: logs = []
            logs.append(new_entry)
            if len(logs) > 50: logs = logs[-50:]
            with open(LOG_PATH, 'w') as f:
                json.dump(logs, f, indent=4)
            print(f"OK [FORENSIC] PLACA CAPTURADA: {formatted_text}", flush=True)
            return True
        except: return False

    def perform_ocr_on_vehicle(self, v_id, data):
        if not data['buffer'] or data['ocr_done']: return False
        print(f"SEARCH [AGENT ALVO #{v_id}] Processando evid\u00eancias temporais...", flush=True)
        reconstructed = self.reconstruct_plate(data['buffer'])
        if reconstructed is None: return False
        cv2.imwrite("/Users/samuel.oliveirabra/Documents/Hermes/agent/debug/last_attempt.jpg", reconstructed)
        ocr_res = self.reader.readtext(reconstructed, detail=0)
        for text in ocr_res:
             if self.log_plate(text, 0.95):
                 data['plate'] = text
                 data['ocr_done'] = True
                 return True
        return False

    def process_stream(self):
        rtsp_url = get_dynamic_rtsp_url()
        if not rtsp_url: return
        print(f"RADAR Operacional em modo din\u00e2mico...", flush=True)
        
        cap = None
        frame_count = 0
        
        while True:
            # Controle de Ativa\u00e7\u00e3o / Hiberna\u00e7\u00e3o
            if not self.is_radar_active():
                if cap is not None:
                    print("RADAR Entrando em modo HIBERNA\u00c7\u00c3O (Economia de Energia).", flush=True)
                    cap.release()
                    cap = None
                    # Limpar estado do radar ao hibernar
                    with open(RADAR_STATE_PATH, 'w') as f:
                        json.dump({"detections": [], "status": "idle"}, f)
                time.sleep(2)
                continue
            
            if cap is None:
                print("RADAR Acordando... Abrindo stream de v\u00eddeo.", flush=True)
                cap = cv2.VideoCapture(get_dynamic_rtsp_url())
                frame_count = 0

            ret, frame = cap.read()
            if not ret:
                time.sleep(2)
                cap = cv2.VideoCapture(get_dynamic_rtsp_url())
                continue

            frame_count += 1
            if frame_count % 3 != 0: continue # Sampler acelerado para M4
            
            # 1. Detec\u00e7\u00e3o e Tracking
            results = self.model(frame, verbose=False)[0]
            current_dets = []
            CLASS_NAMES = {2: "carro", 3: "moto", 5: "\u00f4nibus", 7: "caminh\u00e3o"}
            
            for box in results.boxes:
                if int(box.cls[0]) in CLASS_NAMES:
                    current_dets.append({'box': list(map(int, box.xyxy[0])), 'class': CLASS_NAMES[int(box.cls[0])]})

            active_vehicles, expired_vehicles = self.tracker.update(current_dets, frame_count)
            
            # 2. Processar Alvos que sa\u00edram (Gatilho de Sa\u00edda)
            for v_id, data in expired_vehicles.items():
                if not data['ocr_done']:
                    print(f"RADAR [ALVO #{v_id}] Saindo do visor... Tentativa final.", flush=True)
                    self.perform_ocr_on_vehicle(v_id, data)

            # 3. Processar Alvos Ativos
            radar_detections = []
            for v_id, data in active_vehicles.items():
                x1, y1, x2, y2 = data['box']
                h_f, w_f = frame.shape[:2]
                cy1, cy2 = max(0, y1-60), min(h_f, y2+60)
                cx1, cx2 = max(0, x1-60), min(w_f, x2+60)
                crop = frame[cy1:cy2, cx1:cx2]
                
                if crop.size > 0:
                    up = cv2.resize(crop, None, fx=4, fy=4, interpolation=cv2.INTER_LANCZOS4)
                    gray = cv2.cvtColor(up, cv2.COLOR_BGR2GRAY)
                    data['buffer'].append(self.clahe.apply(gray))
                    if len(data['buffer']) > 6: data['buffer'].pop(0)

                    # Trigger de buffer cheio
                    if len(data['buffer']) >= 4 and not data['ocr_done']:
                        self.perform_ocr_on_vehicle(v_id, data)

                radar_detections.append({
                    "box": data['box'], "class": f"{data['class'].upper()} #{v_id}", "plate": data['plate']
                })

            # 4. Export State
            try:
                h, w = frame.shape[:2]
                with open(RADAR_STATE_PATH + '.tmp', 'w') as f:
                    json.dump({"timestamp": time.time(), "frame_size": [w, h], "detections": radar_detections}, f)
                os.replace(RADAR_STATE_PATH + '.tmp', RADAR_STATE_PATH)
            except: pass
            
        cap.release()

if __name__ == "__main__":
    hermes = HermesForensic()
    hermes.process_stream()
