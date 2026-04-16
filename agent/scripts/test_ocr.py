import easyocr
import cv2
import sys

print("🚀 Iniciando Teste de OCR Tático...", flush=True)
img_path = '/Users/samuel.oliveirabra/Documents/Hermes/agent/debug/test_vision.jpg'
img = cv2.imread(img_path)

if img is None:
    print("❌ Erro: Imagem de teste não encontrada!")
    sys.exit(1)

# Testando em CPU (mais estável para diagnóstico)
print("🧐 Tentando leitura (CPU Mode)...", flush=True)
reader = easyocr.Reader(['pt', 'en'], gpu=False)
results = reader.readtext(img)

if not results:
    print("⚠️ OCR não encontrou nenhum texto na imagem.")
else:
    for (bbox, text, prob) in results:
        print(f"✅ OCR ENCONTROU: '{text}' (confidência: {prob:.2f})", flush=True)

