import subprocess
import os
from flask import Flask, Response

app = Flask(__name__)

# Configurações do Stream (URL Oculta Capturada via ONVIF)
RTSP_URL = os.environ.get('RTSP_URL', 'rtsp://192.168.3.71:554/user=habh_password=XFhnJiUt_channel=0_stream=0&onvif=0.sdp?real_stream')
FFMPEG_PATH = '/opt/homebrew/bin/ffmpeg'

def generate_frames():
    # Comando FFmpeg otimizado
    cmd = [
        FFMPEG_PATH,
        '-rtsp_transport', 'tcp', # Garante que não haja perda de pacotes
        '-i', RTSP_URL,
        '-f', 'image2pipe',
        '-vcodec', 'mjpeg',
        '-q:v', '2',      # Alta qualidade
        '-r', '20',       # Framerate fluido
        '-'
    ]
    
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    try:
        data = b''
        while True:
            chunk = process.stdout.read(1024)
            if not chunk:
                break
            data += chunk
            
            # Localiza o início (0xff 0xd8) e o fim (0xff 0xd9) do frame JPEG
            start = data.find(b'\xff\xd8')
            end = data.find(b'\xff\xd9')
            
            if start != -1 and end != -1:
                jpg = data[start:end+2]
                data = data[end+2:]
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + jpg + b'\r\n')
    except Exception as e:
        print(f"Erro no gateway: {e}")
    finally:
        process.terminate()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    print(f"🛰️ Gateway de Vídeo Hermes iniciado na rede local.")
    print(f"🔗 Capturando: {RTSP_URL}")
    app.run(host='0.0.0.0', port=5001, debug=False)
