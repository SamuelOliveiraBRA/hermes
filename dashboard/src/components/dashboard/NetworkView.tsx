"use client";

import React from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Monitor, Shield, Radio, Activity, Play, Wifi, Scan } from 'lucide-react';
import { CameraPlayer } from '@/components/dashboard/CameraPlayer';
import { AnimatePresence, motion } from 'framer-motion';

export const NetworkView = () => {
  const [data, setData] = React.useState<{ devices: any[] }>({ devices: [] });
  const [loading, setLoading] = React.useState(true);
  const [selectedCamera, setSelectedCamera] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const res = await fetch('/api/network');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Erro ao carregar rede:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchNetwork();
    const interval = setInterval(fetchNetwork, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden text-white">
      <div className="flex flex-col gap-2 flex-none px-4 pt-4">
        <h3 className="text-xs font-black text-violet-400 uppercase tracking-[0.3em]">Olhar Digital (Vigilância)</h3>
        <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Monitoramento Ativo de Ativos na Rede Local</p>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-none px-4">
        <GlassPanel className="p-5 border-violet-500/20 bg-violet-500/5">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1 font-bold">Status da Vigilância</h4>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Rede Local Ativa</p>
            </div>
            <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
              <Shield size={16} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">
              {data.devices.length > 0 ? 'Mapeamento Completo' : 'Sincronizando...'}
            </span>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1 font-bold">Inventário Digital</h4>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">{data.devices.length} Dispositivos Online</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Wifi size={16} />
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '100%' }}
               className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" 
            />
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="flex-1 min-h-0 mx-4 mb-4 p-6 flex flex-col overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <Scan size={18} className="text-violet-400" />
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Mapa de Câmeras IP & Ativos</h4>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Live Feed</span>
             </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-3 relative z-10">
          {data.devices.length > 0 ? (
            data.devices.map((device: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={idx} 
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all group/item"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${device.type === 'camera' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20' : 'bg-white/5 text-white/40 border border-white/5'}`}>
                    {device.type === 'camera' ? <Monitor size={20} /> : <Radio size={20} />}
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-white tabular-nums tracking-tight">{device.ip}</h5>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Portas Ativas: {device.ports.join(', ')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded bg-black/40 ${device.type === 'camera' ? 'text-violet-400 border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.2)]' : 'text-white/40 border border-white/10'}`}>
                      {device.type.toUpperCase()}
                    </span>
                    <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Encriptado</span>
                  </div>
                  
                  {device.type === 'camera' && (
                    <button 
                      onClick={() => setSelectedCamera(device.ip)}
                      className="p-3 rounded-xl bg-violet-600/10 text-violet-400 hover:bg-violet-600 hover:text-white transition-all border border-violet-500/20 group-hover/item:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    >
                      <Play size={16} fill="currentColor" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="relative mb-6">
                <Monitor size={48} className="text-white/5" />
                <div className="absolute inset-0 bg-violet-500/10 blur-3xl rounded-full" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 leading-relaxed">
                Nenhum ativo detectado na varredura passiva.<br/>
                <span className="text-[8px] font-medium tracking-widest mt-2 block opacity-50">Sincronize via Hermes Shell: "scan network"</span>
              </p>
            </div>
          )}
        </div>
      </GlassPanel>

      <AnimatePresence>
        {selectedCamera && (
          <CameraPlayer ip={selectedCamera} onClose={() => setSelectedCamera(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};
