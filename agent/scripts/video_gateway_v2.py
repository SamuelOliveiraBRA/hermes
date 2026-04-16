import subprocess
import os
import json
import time
import requests
from flask import Flask, Response, make_response, jsonify, send_from_directory, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# CONFIGURACOES TATICAS
CAMERA_IP = '192.168.3.71'
ONVIF_PORT = 8899
FFMPEG_PATH = '/opt/homebrew/bin/ffmpeg'
PLATE_LOG_PATH = '/Users/samuel.oliveirabra/Documents/Hermes/agent/memory/plate_logs.json'
RADAR_STATE_PATH = '/Users/samuel.oliveirabra/Documents/Hermes/agent/memory/radar_state.json'
RADAR_ACTIVE_PATH = '/Users/samuel.oliveirabra/Documents/Hermes/agent/memory/radar_active.json'
RECORDINGS_DIR = "/Users/samuel.oliveirabra/Documents/Hermes/agent/recordings"

def get_dynamic_rtsp_url():
    """Obtém o link direto da câmera via ONVIF dinamicamente."""
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
    except Exception as e:
        print(f"⚠️ Erro ao descobrir RTSP: {e}")
    
    # Fallback tático (apenas se ONVIF falhar)
    return "rtsp://admin:samuel2022@192.168.3.71:554/cam/realmonitor?channel=1&subtype=0"

def generate_frames(radar=False):
    """Gerador dinâmico de frames MJPEG ultra-estável via FFMPEG."""
    rtsp_url = get_dynamic_rtsp_url()
    if not rtsp_url: return
    
    # Reduzimos o scale para o Dashboard (800px) para garantir fluidez total
    cmd = [FFMPEG_PATH, '-rtsp_transport', 'tcp', '-i', rtsp_url, '-f', 'image2pipe', '-vcodec', 'mjpeg', '-q:v', '5', '-r', '15', '-vf', 'scale=800:-1', '-']
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    try:
        data = b''
        while True:
            chunk = process.stdout.read(4096)
            if not chunk: break
            data += chunk
            start = data.find(b'\xff\xd8')
            end = data.find(b'\xff\xd9')
            if start != -1 and end != -1:
                jpg = data[start:end+2]
                data = data[end+2:]
                yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + jpg + b'\r\n')
    finally:
        process.terminate()

@app.route('/api/radar')
def get_radar_state():
    """API de Telemetria ultraleve para o Radar Digital."""
    try:
        if os.path.exists(RADAR_STATE_PATH):
            with open(RADAR_STATE_PATH, 'r') as f:
                return jsonify(json.load(f))
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"detections": []})

@app.route('/api/radar/toggle', methods=['POST'])
def toggle_radar():
    """Ativa ou desativa o processamento de LPR."""
    try:
        data = request.json
        state = {"active": bool(data.get("active", False))}
        with open(RADAR_ACTIVE_PATH, 'w') as f:
            json.dump(state, f)
        return jsonify({"status": "ok", "active": state["active"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/radar/status')
def get_radar_status():
    """Retorna se o motor LPR est\u00e1 ativo."""
    if os.path.exists(RADAR_ACTIVE_PATH):
        with open(RADAR_ACTIVE_PATH, 'r') as f:
            return jsonify(json.load(f))
    return jsonify({"active": False})

@app.route('/video_feed')
def video_feed():
    # Parâmetro radar ignorado no sinal de video para garantir estabilidade pura
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/plates')
def get_plates():
    try:
        if os.path.exists(PLATE_LOG_PATH):
            with open(PLATE_LOG_PATH, 'r') as f:
                return jsonify(json.load(f))
    except: pass
    return jsonify([])

@app.route('/recordings/<path:filename>')
def serve_recording(filename):
    return send_from_directory(RECORDINGS_DIR, filename)

if __name__ == '__main__':
    print("🛰️ Hermes Vault Backend v2.3 | Port 5001")
    app.run(host='0.0.0.0', port=5001, debug=False)
