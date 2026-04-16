import math

class ComplianceAuditor:
    """Motor de auditoria inteligente migrado para o Agente Hermes."""
    
    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        R = 6371  # Raio da terra em km
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        a = (math.sin(dLat / 2) * math.sin(dLat / 2) +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dLon / 2) * math.sin(dLon / 2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def audit_expense(self, amount, date, category, lat=None, lon=None, history=[]):
        """Analisa uma despesa em busca de fraudes ou erros."""
        alerts = []
        score = 0
        
        # 1. Duplicatas
        for exp in history:
            if (exp.get('amount') == amount and 
                exp.get('date') == date and 
                exp.get('category') == category):
                score += 40
                alerts.append("Despesa idêntica detectada no histórico.")
                break
        
        # 2. Anomalia Geográfica
        if lat and lon and history:
            last = history[0]
            if last.get('lat') and last.get('lon'):
                dist = self.calculate_distance(lat, lon, last['lat'], last['lon'])
                if dist > 200:
                    score += 30
                    alerts.append(f"Deslocamento suspeito: {dist:.1f}km no mesmo dia.")
        
        # 3. Arredondamentos
        if amount % 50 == 0 and amount > 0:
            score += 5
            alerts.append("Valor arredondado (padrão de recibo manual).")
            
        return {
            "risk_score": min(score, 100),
            "alerts": alerts,
            "status": "High Risk" if score > 50 else "Safe"
        }
