import time
import json
import os
from datetime import datetime
from hermes_blockchain_eye import BlockchainEye

# Caminhos de Dados
CONFIG_PATH = os.path.expanduser("~/Documents/Hermes/agent/hermes_targets.json")
FINDINGS_PATH = os.path.expanduser("~/Documents/Hermes/agent/findings.json")

def load_config():
    if not os.path.exists(CONFIG_PATH):
        return {"addresses": [], "scan_interval_seconds": 900}
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)

def save_findings(findings):
    with open(FINDINGS_PATH, "w") as f:
        json.dump(findings, f, indent=4)

def sentinel_loop():
    print(f"[{datetime.now().isoformat()}] SENTINELA HERMES ATIVADO. Vigiando redes...")
    
    eye = BlockchainEye()
    
    while True:
        try:
            config = load_config()
            addresses = config.get("addresses", [])
            interval = config.get("scan_interval_seconds", 900)
            
            if not addresses:
                # print(f"[{datetime.now().isoformat()}] Nenhum alvo definido. Hibernando...")
                time.sleep(60)
                continue
            
            all_findings = []
            
            for addr in addresses:
                print(f"[{datetime.now().isoformat()}] Varrendo alvo: {addr}")
                opportunities = eye.auto_scan_all(addr)
                
                if opportunities:
                    for op in opportunities:
                        op["found_at"] = datetime.now().isoformat()
                        all_findings.append(op)
            
            # Salva descobertas (sobrescreve para manter apenas o estado atual)
            save_findings({
                "last_scan": datetime.now().isoformat(),
                "findings": all_findings
            })
            
            print(f"[{datetime.now().isoformat()}] Varredura conclu\u00edda. {len(all_findings)} oportunidades registradas.")
            time.sleep(interval)
            
        except Exception as e:
            print(f"[{datetime.now().isoformat()}] Erro no Sentinela: {e}")
            time.sleep(60)

if __name__ == "__main__":
    sentinel_loop()
