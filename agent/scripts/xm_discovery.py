import socket

def discover_xm_camera():
    print("🛰️ Drone de Reconhecimento XM lançado (UDP 34569)...")
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    sock.settimeout(5)
    
    # Broadcast tático XM/iCSee
    msg = b'\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff'
    try:
        sock.sendto(msg, ('255.255.255.255', 34569))
        print("📡 Sinal enviado. Aguardando resposta da câmera...")
        
        while True:
            data, addr = sock.recvfrom(1024)
            print("-" * 30)
            print(f"📦 Resposta Protegida de: {addr}")
            print(f"📄 Dados Brutos (HEX): {data.hex()}")
            # Tentar extrair strings legíveis (como Serial Number)
            try:
                decoded = data.decode('utf-8', errors='ignore')
                print(f"🔍 Texto Capturado: {decoded}")
            except:
                pass
            print("-" * 30)
    except socket.timeout:
        print("❌ Tempo esgotado. Nenhuma câmera respondeu ao broadcast UDP.")
    except Exception as e:
        print(f"❌ Erro operacional: {e}")
    finally:
        sock.close()

if __name__ == "__main__":
    discover_xm_camera()
