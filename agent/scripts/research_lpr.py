import easyocr
import cv2
import numpy as np

print("🔬 Iniciando Pesquisa de Resolução Extrema...", flush=True)
img = cv2.imread('/Users/samuel.oliveirabra/Documents/Hermes/agent/debug/test_vision.jpg')
reader = easyocr.Reader(['pt', 'en'], gpu=False)

# Teste 1: Crop na area provavel da placa (parte inferior central)
h, w = img.shape[:2]
plate_crop = img[int(h*0.6):h, int(w*0.2):int(w*0.8)]
cv2.imwrite('/Users/samuel.oliveirabra/Documents/Hermes/agent/debug/research_plate.jpg', plate_crop)

# Teste 2: Zoom 2x no crop (ja era 3x, entao e 6x do original)
zoom_plate = cv2.resize(plate_crop, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4)
cv2.imwrite('/Users/samuel.oliveirabra/Documents/Hermes/agent/debug/research_zoom.jpg', zoom_plate)

print("🧐 Testando OCR no Crop de Precisão...", flush=True)
results = reader.readtext(zoom_plate)

if not results:
    print("⚠️ Ainda sem texto. Tentando Binarizacao Suave...")
    gray = cv2.cvtColor(zoom_plate, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    cv2.imwrite('/Users/samuel.oliveirabra/Documents/Hermes/agent/debug/research_binary.jpg', binary)
    results = reader.readtext(binary)

if results:
    for (bbox, text, prob) in results:
        print(f"🎯 SUCESSO! CAPTURADO: '{text}' (conf: {prob:.2f})")
else:
    print("❌ Falha em todos os modos basicos. Requer analise de contorno.")

