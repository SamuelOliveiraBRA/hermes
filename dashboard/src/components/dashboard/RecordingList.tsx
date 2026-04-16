import React, { useEffect, useState } from 'react';
import { Play, Calendar, Clock, Film, Download } from 'lucide-react';

interface Recording {
  name: string;
  time: string;
  duration: string;
  size: string;
  token?: string;
}

export function RecordingList() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca as gravações do endpoint que estamos finalizando
    fetch('/api/recordings')
      .then(res => res.json())
      .then(data => {
        setRecordings(data.files || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="mt-8 bg-zinc-950/50 rounded-xl border border-zinc-800 overflow-hidden backdrop-blur-md">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="text-sm font-medium text-zinc-100 uppercase tracking-wider">Histórico do Cartão SD</h3>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono tracking-widest">LOCAL_STORAGE_INDEX</div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-zinc-500 animate-pulse">
            Sincronizando com Cartão SD...
          </div>
        ) : recordings.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-zinc-600 gap-2 border-2 border-dashed border-zinc-900 rounded-lg">
            <Film className="w-8 h-8 opacity-20" />
            <span className="text-sm">Nenhuma gravação encontrada para as últimas 24h</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recordings.map((rec, i) => (
              <div key={i} className="group bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 rounded-lg p-3 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Film className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">{rec.time}</div>
                      <div className="text-[10px] text-zinc-500">{rec.name}</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-zinc-600 hover:text-blue-500 transition-colors" />
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                      <Clock className="w-3 h-3" />
                      {rec.duration}
                    </div>
                    <div className="text-[10px] text-zinc-500">{rec.size}</div>
                  </div>
                  <button className="text-[10px] font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    REPRODUZIR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
