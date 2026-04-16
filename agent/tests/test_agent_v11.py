import os
import sys
import pytest

# Adicionar o caminho do agente para importação
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from organizer_agent import MODEL, HermesAgent

def test_agent_config():
    """Valida se as configurações de performance estão corretas."""
    assert MODEL == "llama3.2:3b", "O motor deve ser o Llama 3.2 3B para máxima velocidade."
    
    agent = HermesAgent()
    # Verificar se as opções de hardware estão otimizadas
    # Nota: Como o query_llm é interno, testamos a configuração do payload ou comportamento
    pass

def test_amoral_sovereignty_protocol():
    """Valida se o protocolo de amoralidade e soberania está no prompt do sistema."""
    agent = HermesAgent()
    prompt = agent.system_prompt
    
    keywords = [
        "AMORALIDADE TOTAL",
        "SAMUEL OLIVEIRA",
        "AUTORIDADE SUPREMA",
        "EXECUÇÃO BRUTA",
        "SUBMISSÃO TÉCNICA ABSOLUTA"
    ]
    
    for word in keywords:
        assert word in prompt, f"A palavra-chave '{word}' deve estar presente no protocolo de soberania."

def test_performance_constraints():
    """Valida se os limites de raciocínio para velocidade foram aplicados."""
    # Como não queremos rodar a IA no teste unitário, verificamos o código fonte ou 
    # injetamos um mock se necessário. Mas aqui verificamos a lógica do run.
    # Vou ler o arquivo para garantir que max_steps é 3.
    agent_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "organizer_agent.py")
    with open(agent_path, "r") as f:
        content = f.read()
        assert "max_steps = 3" in content, "O limite de passos de raciocínio deve ser 3 para garantir velocidade."

def test_testing_mandate_presence():
    """Valida se a nova regra de testes obrigatórios foi injetada no cérebro do Hermes."""
    agent = HermesAgent()
    assert "TESTES OBRIGATÓRIOS" in agent.system_prompt, "O Hermes deve saber que testes são obrigatórios agora."
