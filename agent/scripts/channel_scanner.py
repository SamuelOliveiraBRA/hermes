import subprocess
import urllib.parse

# Senhas que o usuário forneceu
PASSWORDS = ["##samuel283@@", "Ol1ve1r@"]
IP = "192.168.3.71"

# Matriz de Caminhos de 2024
PATHS = [
    "/onvif-media/media.amp",
    "/Streaming/Channels/101",
    "/h264/ch1/main/av_stream",
    "/mpeg4/ch1/main/av_stream",
    "/cam/realmonitor?channel=1&subtype=0",
    "/live/ch0",
    "/live/ch1",
    "/stream1",
    "/stream2",
    "/user=admin&password={pw}&channel=1&stream=0.sdp"
]

def scan_channels():
    print(f"📡 Iniciando Varredura de Canais para o modelo X6-WEQ...")
    for pw in PASSWORDS:
        encoded_pw = urllib.parse.quote(pw)
        for path_template in PATHS:
            path = path_template.replace("{pw}", encoded_pw)
            url = f"rtsp://admin:{encoded_pw}@{IP}:554{path}"
            
            print(f"🔎 Testando: pw=[{pw}] path=[{path}]")
            cmd = ["/opt/homebrew/bin/ffmpeg", "-rtsp_transport", "tcp", "-i", url, "-t", "1", "-f", "null", "-"]
            
            try:
                res = subprocess.run(cmd, capture_output=True, timeout=5)
                if res.returncode == 0:
                    return url, pw, path
            except:
                pass
    return None, None, None

if __name__ == "__main__":
    url, pw, path = scan_channels()
    if url:
        print("\n" + "!" * 50)
        print(f"✅ SUCESSO! CANAL ENCONTRADO!")
        print(f"🔗 URL: {url}")
        print(f"🔑 Senha: {pw}")
        print(f"🎞️ Path: {path}")
        print("!" * 50)
    else:
        print("\n❌ Nenhum canal respondeu com as senhas fornecidas.")
