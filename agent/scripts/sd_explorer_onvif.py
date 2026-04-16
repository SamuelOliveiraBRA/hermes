import requests
import time
from datetime import datetime

class SDExplorerONVIF:
    def __init__(self, ip="192.168.3.71", username="habh", password="XFhnJiUt"):
        self.ip = ip
        self.username = username
        self.password = password
        self.search_url = f"http://{ip}:8899/onvif/ver10/search/wsdl"

    def find_recordings(self, date_str=None):
        """Busca gravações no cartão SD usando o padrão ONVIF Search."""
        if not date_str:
            date_str = datetime.now().strftime("%Y-%m-%dT00:00:00Z")
        else:
            date_str += "T00:00:00Z"

        # Payload SOAP para FindRecordings
        payload = f"""
        <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:tse="http://www.onvif.org/ver10/search/wsdl" xmlns:tt="http://www.onvif.org/ver10/schema">
            <s:Body>
                <tse:FindRecordings>
                    <tse:SearchScope>
                        <tse:IncludedSources>
                            <tt:Type>VideoSource</tt:Type>
                            <tt:Token>VideoSourceToken</tt:Token>
                        </tse:IncludedSources>
                    </tse:SearchScope>
                </tse:FindRecordings>
            </s:Body>
        </s:Envelope>
        """
        
        headers = {'Content-Type': 'application/soap+xml; charset=utf-8'}
        
        try:
            print(f"📡 Enviando busca ONVIF para: {self.search_url}")
            res = requests.post(self.search_url, data=payload, headers=headers, timeout=20)
            content = res.text
            
            if "SearchToken" in content:
                token = content.split("SearchToken>")[1].split("</")[0]
                print(f"✅ SearchToken Obtido: {token}")
                return self.get_results(token)
            else:
                print(f"🔍 RESPOSTA BRUTA:\n{content}")
        except Exception as e:
            print(f"❌ Erro na busca ONVIF: {e}")
        return []

    def get_results(self, token):
        """Obtém os resultados da busca baseados no token."""
        payload = f"""
        <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:tse="http://www.onvif.org/ver10/search/wsdl">
            <s:Body>
                <tse:GetRecordingSearchResults>
                    <tse:SearchToken>{token}</tse:SearchToken>
                    <tse:MinResults>1</tse:MinResults>
                    <tse:MaxResults>50</tse:MaxResults>
                    <tse:WaitTime>PT5S</tse:WaitTime>
                </tse:GetRecordingSearchResults>
            </s:Body>
        </s:Envelope>
        """
        headers = {'Content-Type': 'application/soap+xml; charset=utf-8'}
        try:
            res = requests.post(self.search_url, data=payload, headers=headers, timeout=20)
            content = res.text
            print(f"📊 Resultados obtidos: {len(content)} bytes de dados.")
            return content
        except Exception as e:
            print(f"❌ Erro ao obter resultados: {e}")
        return ""

if __name__ == "__main__":
    explorer = SDExplorerONVIF()
    explorer.find_recordings()
