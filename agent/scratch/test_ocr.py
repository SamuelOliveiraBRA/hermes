import easyocr
import cv2

reader = easyocr.Reader(['pt', 'en'], gpu=True)
img = cv2.imread('/Users/samuel.oliveirabra/Documents/Hermes/agent/debug/last_attempt.jpg')
res = reader.readtext(img, detail=0)
print(f"DEBUG OCR RESULT: {res}")
