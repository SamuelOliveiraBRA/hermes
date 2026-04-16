import os
import json
from web3 import Web3
import requests

class BlockchainEye:
    def __init__(self, rpc_urls=None):
        # RPCs P\u00fablicas Padr\u00e3o (Samuel, depois podemos trocar pelas suas privadas da Alchemy)
        self.networks = rpc_urls or {
            "ethereum": "https://eth.llamarpc.com",
            "polygon": "https://polygon.llamarpc.com",
            "bsc": "https://binance.llamarpc.com"
        }
        
        # REGISTRO DE ELITE (v7.1) - Contratos com alta probabilidade de fundos presos
        self.ELITE_REGISTRY = {
            "stargate": {
                "name": "Stargate Finance",
                "networks": {
                    "ethereum": "0x8731d54E5D02311af303b05609873832120b66F7",
                    "polygon": "0x45A01E4e02F144D45979848BC6298fE487C392F8"
                },
                "abi": '[{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"pendingCredits","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]'
            },
            "polygon_bridge": {
                "name": "Polygon PoS Bridge",
                "networks": {
                    "ethereum": "0xA0c68C638135eE30367884AD568ef296851d5bC8"
                },
                "abi": '[{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"address","name":"rootToken","type":"address"}],"name":"getCheckedOutAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]'
            }
        }
        
        self.connections = {}
        for name, url in self.networks.items():
            try:
                w3 = Web3(Web3.HTTPProvider(url))
                if w3.is_connected():
                    self.connections[name] = w3
            except Exception as e:
                print(f"Erro ao conectar na rede {name}: {e}")

    def scan_unclaimed_bridge_funds(self, user_address):
        """
        Analisa contratos de bridges conhecidas em busca de transa\u00e7\u00f5es pendentes.
        Foco inicial: Stargate e Hop Protocol.
        """
        results = []
        user_address = Web3.to_checksum_address(user_address)
        
        # Simula\u00e7\u00e3o de busca por assinaturas em logs de Bridge
        # Em produ\u00e7\u00e3o, aqui faremos o fetch_logs dos contratos de Bridge
        for net_name, w3 in self.connections.items():
            # Aqui entrar\u00e1 a l\u00f3gica real de cada protocolo
            # Exemplo: Stargate: check se h\u00e1 'pending_credits'
            results.append({
                "network": net_name,
                "protocol": "General Check",
                "status": "Scanning",
                "message": f"Varredura iniciada para {user_address}"
            })
            
        return results

    def analyze_stuck_funds(self, user_address):
        """
        Analisa se h\u00e1 'dust' ou ordens expiradas em DEXs.
        """
        # Exemplo simplificado de busca de saldo
        assets = []
        for net_name, w3 in self.connections.items():
            try:
                balance_wei = w3.eth.get_balance(user_address)
                balance_eth = w3.from_wei(balance_wei, 'ether')
                if balance_eth > 0:
                    assets.append({
                        "network": net_name,
                        "asset": "Native",
                        "amount": float(balance_eth),
                        "status": "Found"
                    })
            except:
                continue
                
        return assets

    def auto_scan_all(self, user_address):
        """
        Executa uma varredura completa usando o ELITE_REGISTRY.
        """
        all_opportunities = []
        user_address = Web3.to_checksum_address(user_address)
        
        # 1. Check de Saldos Nativos
        all_opportunities.extend(self.analyze_stuck_funds(user_address))
        
        # 2. Check de Protocolos de Elite (Real v8.1)
        for p_id, p_data in self.ELITE_REGISTRY.items():
            for net_name, contract_addr in p_data["networks"].items():
                if net_name in self.connections:
                    w3 = self.connections[net_name]
                    try:
                        contract = w3.eth.contract(address=Web3.to_checksum_address(contract_addr), abi=json.loads(p_data["abi"]))
                        
                        if p_id == "stargate":
                            pending = contract.functions.pendingCredits(user_address).call()
                            if pending > 0:
                                all_opportunities.append({
                                    "network": net_name,
                                    "protocol": p_data["name"],
                                    "status": "Found",
                                    "message": f"Cr\u00e9ditos Pendentes detectados!",
                                    "amount": f"{pending / 1e6:.2f} USDC/USDT"
                                })
                        
                        # Adicionar outros protocolos reais aqui...
                        
                    except Exception as e:
                        # Log silencioso de falha de conexão ou contrato
                        continue
                    
        return all_opportunities
