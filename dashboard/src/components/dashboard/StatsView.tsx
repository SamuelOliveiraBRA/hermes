"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Clock, Database } from 'lucide-react';

interface StatsViewProps {
  telemetry: { cpu: string; ram: number };
}

export const StatsView = ({ telemetry }: StatsViewProps) => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px', gap: '20px', color: 'white', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div>
        <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '4px', margin: 0 }}>
          Métricas de Soberania
        </h3>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '3px', margin: '4px 0 0 0' }}>
          Telemetria em Tempo Real do Mac Mini M4
        </p>
      </div>

      {/* Cards superiores */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Clock size={16} color="#a78bfa" />
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: '#a78bfa' }}>Tempo de Atividade</span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: 'white', letterSpacing: '-1px', fontFamily: 'monospace' }}>14:18:22</div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '2px', marginTop: '6px' }}>
            Protocolo Hermes Ativo
          </div>
        </div>

        <div style={{ flex: 1, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Zap size={16} color="#34d399" />
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: '#34d399' }}>Eficiência M4</span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: 'white', letterSpacing: '-1px', fontFamily: 'monospace' }}>98.4%</div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '2px', marginTop: '6px' }}>
            Otimização de Núcleo
          </div>
        </div>
      </div>

      {/* Fluxo de Recursos */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={18} color="#7c3aed" />
            <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px' }}>Fluxo de Recursos</span>
          </div>
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px' }}>
            Sistema Estável
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>CPU</span>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#a78bfa', fontFamily: 'monospace' }}>{telemetry.cpu}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${Math.min(parseFloat(telemetry.cpu) * 10, 100)}%` }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: '999px' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>RAM</span>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#60a5fa', fontFamily: 'monospace' }}>{telemetry.ram}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${telemetry.ram}%` }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #1d4ed8, #60a5fa)', borderRadius: '999px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Área que preenche o restante — elimina o vazio negro */}
      <div style={{ flex: 1, minHeight: 0, borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <Database size={28} color="rgba(255,255,255,0.06)" />
        <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', color: 'rgba(255,255,255,0.12)', margin: 0, textAlign: 'center' }}>
          Telemetria Histórica
        </p>
        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.06)', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
          Sincronizando registros do M4...
        </p>
      </div>
    </div>
  );
};
