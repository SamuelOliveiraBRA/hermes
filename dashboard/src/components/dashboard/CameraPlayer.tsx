"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCcw, Database, PlayCircle, Target } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { PlateFeed } from './PlateFeed';

interface CameraPlayerProps {
  ip: string;
  onClose: () => void;
}

const RadarOverlay = ({ active, radarData }: { active: boolean; radarData: any }) => {
  if (!active || !radarData?.detections) return null;

  const [origW, origH] = radarData.frame_size || [1920, 1080];
  
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox={`0 0 ${origW} ${origH}`} preserveAspectRatio="xMidYMid meet">
      {radarData.detections.map((det: any, idx: number) => {
        const [x1, y1, x2, y2] = det.box;
        return (
          <g key={idx}>
            <rect
              x={x1}
              y={y1}
              width={x2 - x1}
              height={y2 - y1}
              fill="none"
              stroke="#00ff66"
              strokeWidth="4"
              className="animate-pulse"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 102, 0.5))' }}
            />
            <text
              x={x1}
              y={y1 - 10}
              fill="#00ff66"
              fontSize="24"
              fontWeight="black"
              style={{ textShadow: '0 0 10px rgba(0,255,102,0.8)' }}
            >
              {det.plate || det.class?.toUpperCase() || "VEÍCULO"}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const CameraPlayer: React.FC<CameraPlayerProps> = ({ ip, onClose }) => {
  const [showRecordings, setShowRecordings] = useState(false);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [radarActive, setRadarActive] = useState(false);
  const [radarData, setRadarData] = useState<any>(null);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/recordings/list`);
      const data = await response.json();
      setRecordings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar Hermes Vault:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    try {
      await fetch(`http://${window.location.hostname}:5001/api/recordings/capture`, { method: 'POST' });
      alert("📡 Captura Iniciada! O vídeo aparecerá na lista em 30 segundos.");
      setTimeout(fetchRecordings, 32000);
    } catch (error) {
      console.error("Erro ao iniciar captura:", error);
    }
  };

  const toggleRecordings = () => {
    if (!showRecordings) fetchRecordings();
    setShowRecordings(!showRecordings);
  };

  useEffect(() => {
    // Sincronizar estado inicial com o Backend
    const syncRadarStatus = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:5001/api/radar/status`);
        const data = await res.json();
        setRadarActive(data.active);
      } catch (e) {
        console.error("Erro ao sincronizar Radar:", e);
      }
    };
    syncRadarStatus();
  }, []);

  const handleRadarToggle = async () => {
    const newState = !radarActive;
    setRadarActive(newState); // Feedback instant\u00e2neo na UI
    try {
      await fetch(`http://${window.location.hostname}:5001/api/radar/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newState })
      });
    } catch (e) {
      console.error("Falha ao comutar Radar no Backend:", e);
      // Opcional: Reverter UI em caso de erro
    }
  };

  useEffect(() => {
    let radarInterval: any;
    if (radarActive) {
      radarInterval = setInterval(async () => {
        try {
          const res = await fetch(`http://${window.location.hostname}:5001/api/radar`);
          const data = await res.json();
          setRadarData(data);
        } catch (e) {
          console.error("Erro no Radar Polling:", e);
        }
      }, 500);
    } else {
      setRadarData(null);
    }
    return () => clearInterval(radarInterval);
  }, [radarActive]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-2xl"
    >
      <div className="w-full max-w-7xl h-full flex flex-col relative overflow-hidden">
        
        {/* Modal do Player de Vídeo */}
        <AnimatePresence>
          {selectedVideo && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[300] bg-black/95 flex items-center justify-center p-10"
            >
              <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10">
                <video 
                  src={`http://${window.location.hostname}:5001${selectedVideo}`} 
                  controls 
                  autoPlay 
                  className="w-full h-full"
                />
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-4 right-4 p-3 bg-red-500 rounded-full text-white shadow-xl hover:bg-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <GlassPanel className="flex-1 flex flex-col overflow-hidden border-violet-500/30">
          
          {/* Header Tático */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                Central de Comando Tática: {ip}
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleRadarToggle}
                className={`px-4 py-2 border rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  radarActive 
                  ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                }`}
              >
                \ud83d\udce1 {radarActive ? 'Desativar Radar' : 'Ativar Radar'}
              </button>
              <button 
                onClick={handleCapture}
                className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
              >
                🔴 Gravar Agora
              </button>
              <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400 transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Grid Principal */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            <div className="grid grid-cols-12 gap-6">
              
              {/* Coluna de Vídeo e Sim Card */}
              <div className="col-span-12 lg:col-span-9 space-y-6">
                
                {/* Janela de Vídeo Principal */}
                <div className="bg-black rounded-2xl overflow-hidden border border-white/5 relative group aspect-video shadow-2xl">
                  <RadarOverlay active={radarActive} radarData={radarData} />
                  <img 
                    src={`http://${window.location.hostname}:5001/video_feed`} 
                    className="w-full h-full object-contain"
                    alt="Live Stream"
                  />
                  <div className="absolute top-4 left-4 flex gap-2 z-20">
                    <span className="px-2 py-1 bg-black/60 rounded text-[9px] font-bold text-emerald-400 border border-emerald-400/20 uppercase tracking-widest">AO VIVO</span>
                    {radarActive && (
                      <span className="px-2 py-1 bg-blue-500/80 rounded text-[9px] font-bold text-white border border-blue-400/20 uppercase tracking-widest animate-pulse flex items-center gap-1">
                        <Target size={8} /> RADAR ATIVO
                      </span>
                    )}
                  </div>
                </div>

                {/* Seção Sim Card (Hermes Vault) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={toggleRecordings}
                        className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all duration-300 font-black text-[10px] tracking-[0.2em] uppercase ${
                          showRecordings 
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                          : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                        }`}
                      >
                        <Database className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
                        Sim Card Virtual
                      </button>
                      <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest ml-1">Armazenamento Local (Hermes Vault)</span>
                    </div>
                    {loading && <span className="text-[8px] text-blue-400 font-bold animate-pulse uppercase tracking-[0.3em]">Sincronizando...</span>}
                  </div>

                  <AnimatePresence>
                    {showRecordings && (
                      <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      >
                        {recordings.length > 0 ? (
                          recordings.map((rec, index) => (
                            <div 
                              key={index} 
                              onClick={() => setSelectedVideo(rec.url)}
                              className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group hover:border-blue-500/50 transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-black rounded-lg border border-white/10 group-hover:bg-blue-500/20 transition-colors">
                                  <PlayCircle className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-white/80 uppercase tracking-wider truncate max-w-[120px]">{rec.name}</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[8px] text-white/30 uppercase">{rec.date}</p>
                                    <span className="text-[8px] text-blue-500/50 font-bold uppercase tracking-tight">• {rec.size}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full p-10 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                            <p className="text-xs uppercase font-bold text-white/20 tracking-widest">
                              {loading ? "Sincronizando via Hermes Proxy..." : "Nenhuma gravação encontrada no Vault."}
                            </p>
                            <p className="text-[9px] text-white/10 uppercase mt-2">Clique em 'Gravar Agora' para gerar o primeiro vídeo.</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Coluna Radar de Placas Lateral */}
              <div className="col-span-12 lg:col-span-3">
                <div className="bg-white/5 rounded-2xl border border-white/10 p-5 h-full flex flex-col overflow-hidden max-h-[600px]">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                    <RefreshCcw className="w-3 h-3 animate-spin-slow" />
                    Radar LPR
                  </h4>
                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                    <PlateFeed maxItems={20} compact={true} />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Status */}
          <div className="p-4 bg-black/40 border-t border-white/5 flex justify-between items-center">
            <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.2em]">
              Hermes Vault v2.2 — Mac Mini Local Storage
            </p>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-500/20">Encriptado</span>
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Vault Online</span>
            </div>
          </div>

        </GlassPanel>
      </div>
    </motion.div>
  );
};
