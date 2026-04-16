"use client";

import React, { useState, useCallback, useRef } from 'react';
import { useHermes } from '../hooks/useHermes';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MissionControl } from '@/components/dashboard/MissionControl';
import { KnowledgeBase } from '@/components/dashboard/KnowledgeBase';
import { StatsView } from '@/components/dashboard/StatsView';
import { SettingsView } from '@/components/dashboard/SettingsView';
import { NetworkView } from '@/components/dashboard/NetworkView';
import { BlockchainView } from '@/components/dashboard/BlockchainView';
import { BrainFeed, DigitalFootprints } from '@/components/dashboard/Logs';
import { ThinkingPresence } from '@/components/ui/ThinkingPresence';

const MIN_PANEL_WIDTH = 260;
const MAX_PANEL_WIDTH = 600;
const DEFAULT_PANEL_WIDTH = 380;

export default function HermesDashboard() {
  const [activeTab, setActiveTab] = useState('brain');
  const [command, setCommand] = useState("");
  const [leftWidth, setLeftWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(DEFAULT_PANEL_WIDTH);

  const { messages, thoughts, actions, telemetry, isStarting, isThinking, startMission, clearChat } = useHermes();

  // ── Lógica do Divisor Arrastável ──────────────────────────────────────────
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragStartWidth.current = leftWidth;
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - dragStartX.current;
      const newWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, dragStartWidth.current + delta));
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [leftWidth]);

  // ── Conteúdo do painel da direita ─────────────────────────────────────────
  const renderMainContent = () => {
    switch (activeTab) {
      case 'stats':    return <StatsView telemetry={telemetry} />;
      case 'settings': return <SettingsView />;
      case 'network':  return <NetworkView />;
      case 'memory':   return <KnowledgeBase />;
      case 'blockchain': return <BlockchainView />;
      default:
        return (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
            <div style={{ flex: '0 0 40%', minHeight: 0 }}>
              <BrainFeed
                thoughts={thoughts}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isProcessing={isThinking}
              />
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <DigitalFootprints actions={actions} />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      style={{ height: '100vh', overflow: 'hidden', background: '#050505', color: '#e2e8f0', fontFamily: 'sans-serif' }}
      // Impede seleção de texto e muda cursor em todo o documento durante o drag
      className={isDragging ? 'select-none cursor-col-resize' : ''}
    >
      {/* Background Decorativo */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '60%', height: '60%', background: 'rgba(124,58,237,0.1)', filter: 'blur(150px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '50%', height: '50%', background: 'rgba(37,99,235,0.1)', filter: 'blur(120px)', borderRadius: '50%' }} />
      </div>

      {/* Layout Principal */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', height: '100%', padding: '16px', gap: '16px', overflow: 'hidden' }}>

        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Área Central */}
        <main style={{ flex: 1, display: 'flex', overflow: 'hidden', minWidth: 0 }}>

          {/* Painel Esquerdo — Chat */}
          <div style={{ width: `${leftWidth}px`, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: isDragging ? 'none' : 'width 0.05s' }}>
            <MissionControl
              command={command}
              setCommand={setCommand}
              startMission={() => {
                if (command.trim()) {
                  startMission(command);
                  setCommand("");
                }
              }}
              statusMessage={thoughts.length > 0 ? 'HERMES ATIVO' : 'SISTEMA PRONTO'}
              messages={messages}
              thoughts={thoughts}
              actions={actions}
              onClear={clearChat}
              isThinking={isThinking}
              isStarting={isStarting}
            />
          </div>

          {/* ── Divisor Arrastável ── */}
          <div
            onMouseDown={handleDragStart}
            style={{
              width: '8px',
              flexShrink: 0,
              cursor: 'col-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 20,
            }}
            title="Arraste para redimensionar"
          >
            {/* Linha central visível */}
            <div
              style={{
                width: '2px',
                height: '100%',
                background: isDragging
                  ? 'rgba(139,92,246,0.8)'
                  : 'rgba(255,255,255,0.06)',
                borderRadius: '999px',
                transition: isDragging ? 'none' : 'background 0.2s',
                boxShadow: isDragging ? '0 0 12px rgba(139,92,246,0.6)' : 'none',
              }}
            />
            {/* Pontinho central como alça visual */}
            <div
              style={{
                position: 'absolute',
                width: '20px',
                height: '40px',
                borderRadius: '10px',
                background: isDragging
                  ? 'rgba(139,92,246,0.3)'
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isDragging ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                transition: isDragging ? 'none' : 'all 0.2s',
                backdropFilter: 'blur(4px)',
              }}
            >
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '2px', height: '2px', borderRadius: '50%', background: isDragging ? '#a78bfa' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
          </div>

          {/* Painel Direito — Técnico */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {renderMainContent()}
          </div>

        </main>
      </div>

      {/* Overlay de Processamento */}
      <ThinkingPresence isVisible={isThinking} />
    </div>
  );
}
