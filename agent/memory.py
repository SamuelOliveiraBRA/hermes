import sqlite3
import os
import datetime

class HermesMemory:
    """HD Cerebral do Hermes para armazenamento de conhecimento e lições."""
    
    def __init__(self, db_path="~/Documents/Hermes/agent/hermes_brain.db"):
        self.db_path = os.path.expanduser(db_path)
        self._init_db()

    def _init_db(self):
        """Inicializa as tabelas se não existirem."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabela de Conhecimento Geral
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS knowledge (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT,
                key TEXT UNIQUE,
                value TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Tabela de Histórico de Evolução (para não repetir erros)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS evolution_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task TEXT,
                status TEXT,
                lesson_learned TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()

    def save_fact(self, category, key, value):
        """Salva ou atualiza um fato importante."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO knowledge (category, key, value, timestamp)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ''', (category, key, value))
        conn.commit()
        conn.close()
        return f"Fato '{key}' registrado na memória."

    def query_fact(self, key):
        """Recupera um fato pelo nome."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT value FROM knowledge WHERE key = ?', (key,))
        result = cursor.fetchone()
        conn.close()
        return result[0] if result else None

    def get_active_lessons(self, limit=5):
        """Extrai as li\u00e7\u00f5es mais recentes para o contexto do agente."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT task, lesson_learned FROM evolution_log 
            WHERE lesson_learned != "" 
            ORDER BY id DESC LIMIT ?
        ''', (limit,))
        results = cursor.fetchall()
        conn.close()
        if not results: return ""
        
        lessons = "\n--- LI\u00c7\u00d5ES DE MISS\u00d5ES PASSADAS ---\n"
        for task, lesson in results:
            lessons += f"- Em '{task}': {lesson}\n"
        return lessons

    def log_evolution(self, task, status, lesson=""):
        """Registra o progresso de uma missão de auto-evolução."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO evolution_log (task, status, lesson_learned)
            VALUES (?, ?, ?)
        ''', (task, status, lesson))
        conn.commit()
        conn.close()
        return "Evolução logada com sucesso."

if __name__ == "__main__":
    # Teste rápido
    memory = HermesMemory()
    print(memory.save_fact("UI", "design_system", "Glassmorphism with Violet Accents"))
    print("Recuperado:", memory.query_fact("design_system"))
