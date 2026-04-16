import os
import json
import shutil
from tools.organizer import organize_recursive
from tools.compliance import ComplianceAuditor
from memory import HermesMemory
import time
import requests
from hermes_blockchain_eye import BlockchainEye

class Toolbox:
    """Registro central de ferramentas que o Agente Hermes pode usar."""
    
    def __init__(self):
        self.auditor = ComplianceAuditor()
        self.memory = HermesMemory()
        self.tools = {
            "organize_photos": {
                "func": self.tool_organize_photos,
                "description": "Organiza fotos da origem para o destino."
            },
            "list_files": {
                "func": self.tool_list_files,
                "description": "Lista arquivos e pastas em um diretório do Mac."
            },
            "read_file": {
                "func": self.tool_read_file,
                "description": "Lê o conteúdo de um arquivo de texto ou código."
            },
            "save_file": {
                "func": self.tool_save_file,
                "description": "Salva conteúdo em um arquivo. USE backup_file ANTES DE EDITAR."
            },
            "backup_file": {
                "func": self.tool_backup_file,
                "description": "Cria backup .bak de arquivo importante."
            },
            "fetch_knowledge": {
                "func": self.tool_fetch_knowledge,
                "description": "Busca conhecimento t\u00e9cnico em uma URL."
            },
            "get_system_telemetry": {
                "func": self.tool_get_telemetry,
                "description": "Coleta CPU/RAM/Status do Mac Mini M4."
            },
            "remember": {
                "func": self.tool_remember,
                "description": "Salva fato na mem\u00f3ria de longo prazo."
            },
            "recall": {
                "func": self.tool_recall,
                "description": "Recupera fato salvo na mem\u00f3ria."
            },
            "run_tests": {
                "func": self.tool_run_tests,
                "description": "Executa su\u00edte de testes (Pytest/Vitest)."
            },
            "create_test": {
                "func": self.tool_create_test,
                "description": "Gera arquivo de teste para m\u00f3dulo."
            },
            "scan_ip_cameras": {
                "func": self.tool_scan_ip_cameras,
                "description": "Escaneia rede local por câmeras IP."
            },
            "scan_network": {
                "func": self.tool_scan_network,
                "description": "Efetua uma varredura completa da rede local para encontrar todos os dispositivos (Nomes, IPs, Fabricantes)."
            },
            "analyze_blockchain_opportunity": {
                "func": self.tool_analyze_blockchain_opportunity,
                "description": "Analisa um endere\u00e7o ou contrato na blockchain em busca de fundos presos, bridges n\u00e3o reclamadas ou erros de transa\u00e7\u00e3o."
            }
        }

    def get_descriptions(self):
        """Retorna uma string com as ferramentas e o que elas fazem para o Prompt da IA."""
        desc = ""
        for name, info in self.tools.items():
            desc += f"- {name}: {info['description']}\n"
        return desc

    def execute(self, tool_name, params):
        """Executa uma ferramenta específica pelo nome."""
        if tool_name not in self.tools:
            return f"Erro: Ferramenta '{tool_name}' não encontrada."
        
        print(f"--- \u2699\ufe0f EXECUTANDO TOOL: {tool_name} ---")
        try:
            result = self.tools[tool_name]["func"](**params)
            
            # Se o resultado for uma mensagem de erro, logar taticamente
            if isinstance(result, str) and ("Erro" in result or "Falha" in result):
                self.memory.log_evolution(f"tool_{tool_name}", "failure", result)
                
            return result
        except Exception as e:
            err_msg = f"Erro ao executar {tool_name}: {e}"
            self.memory.log_evolution(f"tool_{tool_name}", "exception", err_msg)
            return err_msg

    # --- Definição das Ferramentas (Skills) ---

    def tool_organize_photos(self, source, target):
        """Skill: Organizador Massivo de Fotos."""
        return organize_recursive(source, target, dry_run=False)

    def tool_list_files(self, **kwargs):
        """Skill: Inspetor de Sistema."""
        path = kwargs.get("path") or kwargs.get("directory") or kwargs.get("dir_path")
        if not path:
            return "Erro: Parâmetro 'path' é obrigatório."
        full_path = os.path.expanduser(path)
        if not os.path.exists(full_path):
            return f"Caminho {path} não existe."
        files = os.listdir(full_path)
        return f"Conteúdo de {path}:\n" + "\n".join(files[:20])

    def tool_read_file(self, **kwargs):
        """Skill: Analista de Código."""
        path = kwargs.get("path") or kwargs.get("file_path") or kwargs.get("filePath")
        if not path:
            return "Erro: Parâmetro 'path' ou 'file_path' é obrigatório."
        full_path = os.path.expanduser(path)
        if not os.path.exists(full_path):
            return f"Arquivo {path} não existe."
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                return f.read()[:3000] # Aumentado para 3k para melhor análise
        except Exception as e:
            return f"Erro ao ler arquivo: {e}"

    def tool_audit_rdv(self, amount, date, category, lat=None, lon=None):
        """Skill: Auditor de Fraudes RDV."""
        return self.auditor.audit_expense(amount, date, category, lat, lon)

    def tool_save_file(self, **kwargs):
        """Skill: Codificador Executivo."""
        path = kwargs.get("path") or kwargs.get("file_path")
        content = kwargs.get("content") or kwargs.get("code") or kwargs.get("data")
        if not path or not content:
            return "Erro: Parâmetros 'path' e 'content' são obrigatórios."
        
        # Correção tática para alucinação de tradução (usuário -> Users)
        if path.startswith('/usuário'):
            path = path.replace('/usuário', '/Users/samuel.oliveirabra', 1)
        elif path.startswith('usuário'):
            path = path.replace('usuário', '/Users/samuel.oliveirabra', 1)
            
        full_path = os.path.expanduser(path)
        try:
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
            return f"Arquivo salvo com sucesso em {path}"
        except Exception as e:
            return f"Erro ao salvar arquivo: {e}"

    def tool_backup_file(self, **kwargs):
        """Skill: Guardião de Código."""
        path = kwargs.get("path") or kwargs.get("file_path")
        if not path:
            return "Erro: Parâmetro 'path' é obrigatório."
        full_path = os.path.expanduser(path)
        if not os.path.exists(full_path):
            return f"Erro: Arquivo {path} não existe para fazer backup."
        backup_path = full_path + ".bak"
        try:
            shutil.copy2(full_path, backup_path)
            return f"Backup criado em {backup_path}"
        except Exception as e:
            return f"Erro ao criar backup: {e}"

    def tool_fetch_knowledge(self, **kwargs):
        """Skill: Explorador de Conhecimento Web."""
        url = kwargs.get("url")
        if not url: return "Erro: URL obrigatória."
        try:
            response = requests.get(url, timeout=10)
            return f"Conteúdo de {url}:\n" + response.text[:2000]
        except Exception as e:
            return f"Erro ao acessar {url}: {e}"

    def tool_get_telemetry(self, **kwargs):
        """Skill: Diagnóstico de Hardware M4."""
        try:
            import subprocess
            cpu = subprocess.getoutput("sysctl -n vm.loadavg | awk '{print $2}'")
            mem = subprocess.getoutput("top -l 1 | grep 'PhysMem' | awk '{print $2}'")
            return f"Telemetria Mac Mini M4: CPU Load: {cpu} | RAM em uso: {mem}"
        except Exception as e:
            return f"Erro na telemetria: {e}"

    def tool_remember(self, **kwargs):
        """Skill: Escrita de Memória."""
        key = kwargs.get("key")
        value = kwargs.get("value")
        category = kwargs.get("category", "general")
        if not key or not value: return "Erro: Parâmetros 'key' e 'value' obrigatórios."
        return self.memory.save_fact(category, key, value)

    def tool_recall(self, **kwargs):
        """Skill: Leitura de Memória."""
        key = kwargs.get("key")
        if not key: return "Erro: Parâmetro 'key' obrigatório."
        return self.memory.query_fact(key)

    def tool_run_tests(self, **kwargs):
        """Skill: Validador de Integridade (QA)."""
        import subprocess
        path = kwargs.get("path", ".")
        # Detectar se é Python ou JS
        if "dashboard" in path:
            cmd = "export PATH=$PATH:/usr/local/bin && cd /Users/samuel.oliveirabra/Documents/Hermes/dashboard && npx vitest run --passWithNoTests"
        else:
            cmd = "python3 -m pytest " + path
            
        try:
            result = subprocess.getoutput(cmd)
            return f"--- 🧪 RELATÓRIO DE TESTES ---\n{result}"
        except Exception as e:
            return f"Erro ao rodar testes: {e}"

    def tool_create_test(self, **kwargs):
        """Skill: Arquiteto de Testes."""
        file_path = kwargs.get("path")
        test_content = kwargs.get("test_code")
        if not file_path or not test_content:
            return "Erro: 'path' e 'test_code' são obrigatórios."
        
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(test_content)
            return f"🧪 Teste criado em {file_path}. Use 'run_tests' para validar."
        except Exception as e:
            return f"Erro ao criar testee: {e}"

    def tool_scan_ip_cameras(self, **kwargs):
        """Skill: Olhar Digital (Network Scanner + Data Bridge)."""
        import subprocess
        import json
        import re
        import os
        
        target = kwargs.get("target", "192.168.3.0/24")
        ports = "80,443,554,8000,8080,81,8888"
        
        cmd = f"/opt/homebrew/bin/nmap -p {ports} --open {target}"
        try:
            output = subprocess.getoutput(cmd)
            
            # Parser simples para extrair IPs e portas abertas
            devices = []
            current_ip = None
            
            for line in output.split('\n'):
                ip_match = re.search(r'Nmap scan report for ([\d\.]+)', line)
                if ip_match:
                    current_ip = ip_match.group(1)
                    devices.append({"ip": current_ip, "ports": [], "type": "unknown"})
                
                port_match = re.search(r'(\d+)/tcp\s+open', line)
                if port_match and current_ip:
                    port = port_match.group(1)
                    devices[-1]["ports"].append(port)
                    # Heurística para Câmeras: Porta 554 (RTSP) ou portas comuns de DVR
                    if port in ['554', '8000', '8080', '8888']:
                        devices[-1]["type"] = "camera"
            
            # Salvar na memória do Agente para o Dashboard consumir
            memory_path = "/Users/samuel.oliveirabra/Documents/Hermes/agent/memory/network_assets.json"
            with open(memory_path, "w") as f:
                json.dump({"last_scan": output, "devices": devices}, f, indent=2)
                
            return f"--- \u2690\ufe0f VIGIL\u00c2NCIA CONCLU\u00cdDA ---\nEncontrados {len(devices)} dispositivos. Mapa atualizado em memory/network_assets.json"
        except Exception as e:
            return f"Erro no scan de rede: {e}"

    def tool_scan_network(self, **kwargs):
        """Skill: Raio-X de Rede Soberano."""
        import subprocess
        import re
        import json
        
        target = kwargs.get("target", "192.168.3.0/24")
        nmap_path = "/opt/homebrew/bin/nmap"
        
        # Ping scan para descoberta r\u00e1pida de nomes e fabricantes
        cmd = f"{nmap_path} -sn {target}"
        try:
            output = subprocess.getoutput(cmd)
            
            devices = []
            # Regex master para capturar Hostname (opcional) e IP
            # Ex: Nmap scan report for MyDevice (192.168.1.5)
            # Ex: Nmap scan report for 192.168.1.1
            chunks = output.split("Nmap scan report for ")
            
            for chunk in chunks[1:]:
                lines = chunk.split('\n')
                first_line = lines[0].strip()
                
                name = "Unknown"
                ip = first_line
                
                if "(" in first_line:
                    name_match = re.search(r'([^\s]+)\s+\(([\d\.]+)\)', first_line)
                    if name_match:
                        name = name_match.group(1)
                        ip = name_match.group(2)
                
                vendor = "Detecc\u00e3o pendente"
                for line in lines:
                    if "MAC Address:" in line:
                        vendor_match = re.search(r'MAC Address: [A-F0-9:]+ \((.*)\)', line)
                        if vendor_match:
                            vendor = vendor_match.group(1)
                
                devices.append({
                    "name": name,
                    "ip": ip,
                    "vendor": vendor
                })
            
            # Persist\u00eancia na mem\u00f3ria
            memory_file = "/Users/samuel.oliveirabra/Documents/Hermes/agent/memory/network_assets.json"
            with open(memory_file, "w", encoding="utf-8") as f:
                json.dump(devices, f, indent=2)
                
            res = "--- \u1f6f0\ufe0f MAPA DE REDE ATUALIZADO ---\n"
            for d in devices[:15]: # Limite para o chat não poluir
                res += f"- {d['name']} | {d['ip']} | {d['vendor']}\n"
            
            if len(devices) > 15:
                res += f"\n... e mais {len(devices) - 15} dispositivos encontrados."
                
            return res
        except Exception as e:
            return f"Erro ao escanear rede: {e}"

    def tool_analyze_blockchain_opportunity(self, **kwargs):
        """Skill: Detetive On-Chain."""
        address = kwargs.get("address")
        if not address:
            return "Erro: Endere\u00e7o da carteira n\u00e3o fornecido."
            
        try:
            eye = BlockchainEye()
            # Evolu\u00e7\u00e3o v7.1: Varredura Autom\u00e1tica Global
            opportunities = eye.auto_scan_all(address)
            
            res = f"--- \ud83d\udd0d RELAT\u00d3RIO DE ARQUEOLOGIA GLOBAL: {address[:10]}... ---\n"
            res += f"Protocolos Monitorados: {len(eye.ELITE_REGISTRY)} | Redes: {len(eye.connections)}\n"
            
            if not opportunities:
                return res + "Nenhuma oportunidade \u00f3bvia encontrada no momento."
                
            res += "\n\ud83d\udcb0 OPORTUNIDADES IDENTIFICADAS:\n"
            for op in opportunities:
                status_icon = "\ud83d\udfe2" if op.get("status") == "Found" else "\ud83d\udd0d"
                res += f"{status_icon} [{op['network']}] {op['protocol']}: {op['message'] if 'message' in op else op['amount']}\n"
                    
            res += "\n[!] Nota: Use estes dados para resgate manual via Dashboard."
            return res
        except Exception as e:
            return f"Erro na an\u00e1lise on-chain: {e}"
