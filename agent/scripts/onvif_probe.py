import sys
from onvif import ONVIFCamera

def probe_camera(ip, port, user, password):
    print(f"🛰️ Tentando comunicação ONVIF com {ip}:{port} (User: {user})")
    try:
        # iCSee/XM costumam usar WSDLs padrão
        mycam = ONVIFCamera(ip, port, user, password, '/Users/samuel.oliveirabra/Documents/Hermes/agent/wsdl/')
        
        # Obter informações do dispositivo
        dev_info = mycam.devicemgmt.GetDeviceInformation()
        print(f"✅ Fabricante: {dev_info.Manufacturer}")
        print(f"✅ Modelo: {dev_info.Model}")
        print(f"✅ Firmware: {dev_info.FirmwareVersion}")
        
        # Tentar obter os perfis de vídeo
        media_service = mycam.create_media_service()
        profiles = media_service.GetProfiles()
        
        print(f"🎥 Canais de Vídeo encontrados: {len(profiles)}")
        for profile in profiles:
            stream_uri = media_service.GetStreamUri({
                'StreamSetup': {'Stream': 'RTP-Unicast', 'Transport': {'Protocol': 'RTSP'}},
                'ProfileToken': profile.token
            })
            print(f"🔗 Stream URI ({profile.Name}): {stream_uri.Uri}")
            
        return True
    except Exception as e:
        print(f"❌ Falha na sonda ONVIF: {e}")
        return False

if __name__ == "__main__":
    IP = "192.168.3.71"
    PORT = 8899
    
    # Testar combinações baseadas no que o usuário passou e padrões
    creds = [
        ("admin", "Ol1ve1r@"),
        ("admin", "##samuel283@@"),
        ("admin", "admin"),
        ("admin", "123456"),
        ("admin", ""),
    ]
    
    for user, pw in creds:
        if probe_camera(IP, PORT, user, pw):
            print("\n🚨 SUCESSO ABSOLUTO! Dados interceptados via ONVIF.")
            break
