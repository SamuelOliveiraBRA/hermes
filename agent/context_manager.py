import json
import requests
import os

class ContextManager:
    """M\u00f3dulo Modular para Gest\u00e3o de Intelig\u00eancia e Redu\u00e7\u00e3o de Tokens."""
    
    def __init__(self, ollama_url="http://localhost:11434/api/chat", model="glm-4.7-flash"):
        self.ollama_url = ollama_url
        self.model = model
        self.max_obs_chars = 1500 # Limite para resumo automático de ferramentas
        self.max_history_chars = 6000 # Gatilho para compressão de histórico

    def compress_history(self, history):
        """Usa o LLM para condensar o hist\u00f3rico de ac\u00e7\u00f5es em um resumo denso."""
        if len(history) < self.max_history_chars:
            return history
            
        print("BRAIN [CONTEXT] Hist\u00f3rico longo detectado. Iniciando Compress\u00e3o Recursiva...")
        
        prompt = f"""Resuma o progresso das tarefas descritas no hist\u00f3rico abaixo em no m\u00e1ximo 3 frases densas e t\u00e9cnicas. 
Mantenha os resultados de arquivos ou falhas importantes.
Hist\u00f3rico:
{history}

Resumo T\u00e9cnico:"""

        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.1}
        }
        
        try:
            r = requests.post(self.ollama_url, json=payload)
            summary = r.json().get('response', "Erro ao resumir.")
            return f"\n--- RESUMO DE PASSOS ANTERIORES ---\n{summary}\n--- FIM DO RESUMO ---\n"
        except Exception as e:
            print(f"ERROR Falha na compress\u00e3o: {e}")
            return history[-2000:] # Fallback: Pega apenas o final se falhar

    def clip_observation(self, tool_name, result):
        """Intercepta e condensa resultados de ferramentas se forem muito longos."""
        if not isinstance(result, str):
            result = str(result)
            
        if len(result) > self.max_obs_chars:
            summary_prompt = f"""O resultado da ferramenta '{tool_name}' \u00e9 muito longo ({len(result)} caracteres). 
Resuma os pontos principais e extraia apenas dados estruturais ou erros cr\u00edticos.
Conte\u00fado:
{result[:5000]} 

Resumo da Tool:"""

            payload = {
                "model": self.model,
                "prompt": summary_prompt,
                "stream": False,
                "options": {"temperature": 0.1}
            }
            
            try:
                r = requests.post(self.ollama_url, json=payload)
                summary = r.json().get('response', "Erro no resumo da ferramenta.")
                return f"[OBSERVA\u00c7\u00c3O CONDENSADA DE {tool_name}]: {summary}\n(Conte\u00fado completo disponível via 'recall' ou nos logs de disco)"
            except:
                return result[:self.max_obs_chars] + "... [TRUNCADO PARA ECONOMIA DE TOKENS]"
        
        return result

if __name__ == "__main__":
    # Teste de Laborat\u00f3rio
    cm = ContextManager()
    print("Teste de Clip:", cm.clip_observation("fetch", "A" * 2000))
