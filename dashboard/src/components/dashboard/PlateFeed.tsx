import React, { useEffect, useState } from 'react';
import { Target, Camera, Activity } from 'lucide-react';

interface PlateLog {
  plate: string;
  confidence: number;
  timestamp: string;
}

interface PlateFeedProps {
  maxItems?: number;
  compact?: boolean;
}

export function PlateFeed({ maxItems = 5, compact = false }: PlateFeedProps) {
  const [plates, setPlates] = useState<PlateLog[]>([]);
  const [standby, setStandby] = useState(true);

  useEffect(() => {
    const fetchPlates = async () => {
      try {
        // Aponta para o Gateway Hermes na porta 5001
        const res = await fetch(`http://${window.location.hostname}:5001/api/plates`);
        const data = await res.json();
        
        // O Python retorna uma lista bruta de objetos de log
        if (Array.isArray(data) && data.length > 0) {
          setPlates(data);
          setStandby(false);
        } else {
          // Mantém em standby se não houver registros recentes
          setStandby(data.length === 0);
        }
      } catch (e) {
        console.error("📡 Erro de Link LPR:", e);
        // setStandby(true); // Evita oscilação visual agressiva
      }
    };

    const interval = setInterval(fetchPlates, 2000);
    return () => clearInterval(interval);
  }, []);

  if (standby) {
    return (
      <div className={`flex flex-col items-center justify-center border-2 border-dashed border-zinc-900 rounded-2xl gap-4 ${compact ? 'h-full p-4' : 'h-48'}`}>
        <Activity className={`${compact ? 'w-6 h-6' : 'w-10 h-10'} text-zinc-800 animate-pulse`} />
        <div className="text-center">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest animate-pulse font-mono flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
            SISTEMA EM GUARDA
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {plates.slice(-maxItems).reverse().map((plate, index) => {
        // Lógica de "Estacionado": Se for a detecção mais recente e o sistema estiver em loop nela
        const isParked = index === 0 && plates.length > 1; 

        return (
          <div 
            key={index}
            className={`flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl border transition-all group ${
              isParked ? 'border-blue-500/40 bg-blue-500/5' : 'border-zinc-800/50 hover:border-blue-500/30'
            } ${compact ? 'py-2 px-3' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20`}>
                <Target className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-500 ${isParked ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className={`${compact ? 'text-sm' : 'text-md'} font-mono font-bold text-zinc-100 group-hover:text-blue-400 transition-colors`}>
                    {plate.plate}
                  </div>
                  {isParked && (
                    <span className="px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-sm animate-pulse">
                      ESTACIONADO
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none">
                  {plate.timestamp.split(' ')[1]}
                </div>
              </div>
            </div>
            <div className={`w-1.5 h-1.5 rounded-full ${isParked ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
          </div>
        );
      })}
    </div>
  );
}
