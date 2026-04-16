import socket
import json
import struct
import time
from datetime import datetime

class XMeyeBinaryExplorer:
    def __init__(self, ip="192.168.3.71", port=34567, username="admin", password="8AAR5aH1"):
        self.ip = ip
        self.port = port
        self.username = username
        self.password = password
        self.session_id = 0

    def _build_packet(self, payload_name, payload_data):
        """Constrói um pacote binário no padrão XMeye/NetSurveillance."""
        full_payload = {
            "Name": payload_name,
            **payload_data
        }
        json_str = json.dumps(full_payload)
        json_bytes = json_str.encode('utf-8')
        
        # Cabeçalho XMeye: 20 bytes
        # [0:1] ff - Início
        # [1:2] 00 - Versão?
        # [2:4] 0000 - Reservado
        # [4:8] SessionID (Little Endian)
        # [8:10] 0000 - Reservado
        # [10:12] 0000 - Reservado
        # [12:14] Command ID (0x03E8 para Config/JSON)
        # [14:18] Payload Length
        # [18:20] 0a00 - Fim do cabeçalho
        
        header = bytearray([0xff, 0x01, 0x00, 0x00])
        header += struct.pack("<I", self.session_id)
        header += bytearray([0x00, 0x00, 0x00, 0x00])
        header += struct.pack("<H", 1000) # Command ID 1000 (0x03E8)
        header += struct.pack("<I", len(json_bytes))
        header += bytearray([0x00, 0x00])
        
        return header + json_bytes

    def send_command(self, name, data):
        """Envia um comando binário e lê a resposta JSON."""
        packet = self._build_packet(name, data)
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(10)
                s.connect((self.ip, self.port))
                s.sendall(packet)
                
                # Lê o cabeçalho da resposta (20 bytes)
                header = s.recv(20)
                if len(header) < 20:
                    return None
                    
                # Extrai o tamanho do payload do cabeçalho
                payload_len = struct.unpack("<I", header[14:18])[0]
                
                # Lê o payload JSON
                payload_bytes = b""
                while len(payload_bytes) < payload_len:
                    chunk = s.recv(payload_len - len(payload_bytes))
                    if not chunk: break
                    payload_bytes += chunk
                
                return json.loads(payload_bytes.decode('utf-8', errors='ignore'))
        except Exception as e:
            print(f"❌ Erro na comunicação binária: {e}")
            return None

    def login(self):
        """Realiza o login binário para obter a sessão."""
        data = {
            "OPLogin": {
                "UserName": self.username,
                "Password": self.password,
                "LoginType": "Address"
            }
        }
        res = self.send_command("OPLogin", data)
        if res and res.get("Ret") == 100:
            self.session_id = res.get("SessionID", 0)
            print(f"✅ Login Binário XMeye realizado! SessionID: {self.session_id}")
            return True
        print(f"⚠️ Falha no login binário: {res}")
        return False

    def find_files(self):
        """Busca arquivos no cartão SD."""
        if not self.session_id and not self.login():
            return []
            
        date_str = datetime.now().strftime("%Y-%m-%d")
        data = {
            "OPFileFind": {
                "Channel": 0,
                "Combin": "Time",
                "FileType": "h264",
                "Search": {
                    "BeginTime": f"{date_str} 00:00:00",
                    "EndTime": f"{date_str} 23:59:59"
                }
            }
        }
        res = self.send_command("OPFileFind", data)
        if res and res.get("Ret") == 100:
            files = res.get("OPFileFind", [])
            print(f"📂 Encontrados {len(files)} arquivos (Protocolo Binário).")
            return files
        return []

if __name__ == "__main__":
    explorer = XMeyeBinaryExplorer()
    explorer.find_files()
