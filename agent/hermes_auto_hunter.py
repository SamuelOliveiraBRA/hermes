import time
import json
import os
import random
from web3 import Web3
from datetime import datetime
from hermes_blockchain_eye import BlockchainEye
from hermes_contract_exploiter import ContractExploiter

# Paths Dynamically Linked for Portability
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BOUNTY_PATH = os.path.join(BASE_DIR, "hermes_bounty.json")
LOCK_PATH = os.path.join(BASE_DIR, "hunter.lock")

# The Hunter runs using the same endpoints as BlockchainEye
# To avoid rate limits on free RPCs, we pace the scanning
SCAN_DELAY = 5.0 # Seconds between address scans

def init_bounty_file():
    if not os.path.exists(BOUNTY_PATH):
        with open(BOUNTY_PATH, "w") as f:
            json.dump([], f)

def log_bounty(opportunity, current_addr):
    init_bounty_file()
    try:
        with open(BOUNTY_PATH, "r") as f:
            bounties = json.load(f)
    except:
        bounties = []
        
    opportunity["hunter_target"] = current_addr
    opportunity["discovered_at"] = datetime.now().isoformat()
    
    # Avoid duplicates
    duplicate = False
    for b in bounties:
        if b.get("hunter_target") == current_addr and b.get("protocol") == opportunity.get("protocol"):
            duplicate = True
            break
            
    if not duplicate:
        bounties.insert(0, opportunity)
        # Keep only the latest 100
        bounties = bounties[:100]
        
        with open(BOUNTY_PATH, "w") as f:
            json.dump(bounties, f, indent=4)
            
        print(f"[{datetime.now().isoformat()}] BINGO! Bountry logged: {opportunity['protocol']} em {opportunity['network']}")


def hunter_loop():
    print(f"[{datetime.now().isoformat()}] 🐺 AUTO-HUNTER INICIADO. Faro ligado.")
    init_bounty_file()
    
    # Creates lock file to indicate background process is running
    with open(LOCK_PATH, "w") as f:
        f.write(str(os.getpid()))
        
    eye = BlockchainEye()
    
    # We will pick one specific network to harvest addresses from, e.g., Polygon because block time is 2s max
    # or Ethereum because it has richer transactions. Let's use Ethereum for harvesting.
    try:
        harvest_w3 = eye.connections.get("ethereum") or list(eye.connections.values())[0]
    except Exception as e:
        print("Erro: Nenhuma rede conectada. Abortando hunter.")
        if os.path.exists(LOCK_PATH): os.remove(LOCK_PATH)
        return

    tracked_addresses = set()
    
    try:
        while True:
            # Recheck lock file to see if we should stop
            if not os.path.exists(LOCK_PATH):
                print(f"[{datetime.now().isoformat()}] Hunter parado pelo Painel de Comando.")
                break
                
            try:
                # 1. Harvest Addresses from the Latest Block
                latest_block_number = harvest_w3.eth.block_number
                print(f"[{datetime.now().isoformat()}] Minerando Bloco #{latest_block_number} para extrair carteiras...")
                
                # Fetch light block (only hashes) to avoid immediate 429 Rate Limit from public RPCs
                block = harvest_w3.eth.get_block(latest_block_number)
                tx_hashes = block.transactions
                
                sample_size = min(3, len(tx_hashes))
                if sample_size == 0:
                    time.sleep(3)
                    continue
                    
                selected_tx_hashes = random.sample(list(tx_hashes), sample_size)
                
                addresses_to_scan = []
                for tx_hash in selected_tx_hashes:
                    time.sleep(1) # Pacing between small calls
                    try:
                        tx_data = harvest_w3.eth.get_transaction(tx_hash)
                        if tx_data and tx_data.get('to'): # Focando no destino (pode ser contrato)
                            target_addr = tx_data['to']
                            if target_addr not in tracked_addresses:
                                addresses_to_scan.append({"address": target_addr, "tx": tx_hash.hex()})
                                tracked_addresses.add(target_addr)
                    except Exception as tx_e:
                        pass
                        
                # If we tracked too many, clear the cache to avoid memory leak
                if len(tracked_addresses) > 10000:
                    tracked_addresses.clear()

                # Phase 2: Vulnerabilidade On-Chain REAL e Arbitragem (Sem mockup)
                exploiter = ContractExploiter(harvest_w3)
                print(f"[{datetime.now().isoformat()}] Lendo Reservas da Mainnet (Uniswap & Sushiswap) para Real-Time Arbitragem...")
                
                try:
                    # Roda o Scanner Matemático On-Chain Real
                    opportunities = exploiter.scan_live_arbitrage()
                    for op in opportunities:
                        log_bounty(op, "ARBITRAGE_MEV_REAL")
                except Exception as e:
                    print(f"[{datetime.now().isoformat()}] Erro lendo reservas das DEXes: {e}")
                
                 # Small patience to avoid node rate limit (even when looking at pools instead of 100 random tx)
                time.sleep(SCAN_DELAY * 2)

            except Exception as e:
                print(f"[{datetime.now().isoformat()}] Erro no loop de harvest: {str(e)}")
                time.sleep(10)
                
    finally:
        if os.path.exists(LOCK_PATH):
            os.remove(LOCK_PATH)
        print("Auto-Hunter Encerrado.")

if __name__ == '__main__':
    hunter_loop()
