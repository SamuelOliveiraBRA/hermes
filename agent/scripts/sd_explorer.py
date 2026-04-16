import requests
import json
import time
from datetime import datetime

class SDExplorer:
    def __init__(self, ip="192.168.3.71", username="habh", password="XFhnJiUt"):
        self.ip = ip
        self.username = username
        self.password = password
        self.session_id = None
        self.base_url = f"http://{ip}"

    def login(self):
        """Realiza o login no protocolo XMeye para obter o SessionID."""
        url = f"{self.base_url}/cgi-bin/login.cgi"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Accept": "application/json, text/javascript, */*; q=0.01"
        }
        payload = {
            "Name": "OPLogin",
            "OPLogin": {
                "UserName": self.username,
                "Password": self.password,
                "LoginType": "Address"
            }
        }
        try:
            res = requests.post(url, data=json.dumps(payload), headers=headers, timeout=10)
            data = res.json()
            if data.get("Ret") == 100:
                self.session_id = data.get("SessionID")
                print(f"✅ Login XMeye realizado: {self.session_id}")
                return True
            else:
                print(f"❌ Falha no login: {data}")
        except Exception as e:
            print(f"❌ Erro de conexão no login: {e}")
        return False

    def find_files(self, date_str=None):
        """Busca arquivos de gravação no cartão SD para uma data específica (YYYY-MM-DD)."""
        if not self.session_id and not self.login():
            return []

        if not date_str:
            date_str = datetime.now().strftime("%Y-%m-%d")

        url = f"{self.base_url}/cgi-bin/media.cgi"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Accept": "application/json, text/javascript, */*; q=0.01"
        }
        payload = {
            "Name": "OPFileFind",
            "OPFileFind": {
                "Channel": 0,
                "Combin": "Time",
                "FileType": "h264",
                "Search": {
                    "BeginTime": f"{date_str} 00:00:00",
                    "EndTime": f"{date_str} 23:59:59"
                }
            },
            "SessionID": self.session_id
        }

        try:
            res = requests.post(url, data=json.dumps(payload), headers=headers, timeout=15)
            data = res.json()
            if data.get("Ret") == 100:
                files = data.get("OPFileFind", [])
                print(f"📂 Encontrados {len(files)} arquivos no cartão SD.")
                return files
            else:
                print(f"⚠️ Nenhuma gravação encontrada ou erro: {data}")
        except Exception as e:
            print(f"❌ Erro ao buscar arquivos: {e}")
        return []

if __name__ == "__main__":
    explorer = SDExplorer()
    recordings = explorer.find_files()
    for rec in recordings[:5]:
        print(f"🎥 {rec.get('BeginTime')} - {rec.get('EndTime')} ({rec.get('FileName')})")
