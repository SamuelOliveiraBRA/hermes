import subprocess
import urllib.parse
import os

# Dados fornecidos pelo Samuel
PASSWORD = "##samuel283@@"
IP = "192.168.3.71"
USERS = ["admin", "tatianapatriciamartinezospino@hotmail.com", "tatiana", "Samuel", "Claudete"]

# Caminhos exaustivos para iCSee 2024
PATHS = [
    "/live/ch0",
    "/live/ch1",
    "/stream1",
    "/onvif-media/media.amp",
    "/Streaming/Channels/101",
    "/h264/ch1/main/av_stream",
    "/cam/realmonitor?channel=1&subtype=0",
    "/user={user}&password={password}&channel=1&stream=0.sdp"
]

FFMPEG = "/opt/homebrew/bin/ffmpeg"

def test_password():
    print(f"🚀 Iniciando Operação Foco Total: Senha [##samuel283@@]")
    print("-" * 50)
    
    encoded_pw = urllib.parse.quote(PASSWORD)
    
    for user in USERS:
        encoded_user = urllib.parse.quote(user)
        for path_template in PATHS:
            path = path_template.format(user=encoded_user, password=encoded_pw)
            url = f"rtsp://{encoded_user}:{encoded_pw}@{IP}:554{path}"
            
            print(f"🔎 Tentando: User=[{user}] Path=[{path}]")
            
            cmd = [FFMPEG, "-rtsp_transport", "tcp", "-i", url, "-t", "1", "-f", "null", "-"]
            
            try:
                # Timeout curto para agilizar
                res = subprocess.run(cmd, capture_output=True, timeout=5)
                if res.returncode == 0:
                    return url, user, path
            except:
                pass
    return None, None, None

if __name__ == "__main__":
    url, user, path = test_password()
    if url:
        print("\n" + "!" * 50)
        print(f"🚨 SUCESSO ABSOLUTO! O SINAL FOI ABERTO!")
        print(f"👤 Usuário: {user}")
        print(f"🔗 URL: {url}")
        print("!" * 50)
    else:
        print("\n❌ A senha ##samuel283@@ ainda não liberou o sinal nos caminhos testados.")
