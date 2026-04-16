"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, Crosshair, ExternalLink, AlertCircle, Coins, Clock, Activity, Zap } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';

export const BlockchainView = () => {
  const [address, setAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isAutoPilot, setIsAutoPilot] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [isInjecting, setIsInjecting] = useState(false);

  const handleExecute = (res: any) => {
     setIsInjecting(true);
     setExecutionLog(["[SYS] Inicializando Protocolo de Extração..."]);
     setTimeout(() => setExecutionLog(prev => [...prev, `[RPC] Resolvendo rota para o alvo: ${res.protocol || res.network || 'Desconhecido'}`]), 600);
     setTimeout(() => setExecutionLog(prev => [...prev, `[WEB3] Preparando payload da transação da Mainnet (Opcodes)...`]), 1400);
     
     // Tentativa agressiva de chamar wallet
     setTimeout(async () => {
       if (typeof (window as any).ethereum !== 'undefined') {
          setExecutionLog(prev => [...prev, "[WEB3] Solicitando conexão da Metamask/Provider..."]);
          try {
              // 1. Estabelecer Handshake de Conexão
              const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
              const userAddress = accounts[0];
              setExecutionLog(prev => [...prev, `[SUCCESS] Carteira vinculada: ${userAddress.slice(0,6)}...`]);
              
              setExecutionLog(prev => [...prev, "[WEB3] Disparando Payload On-Chain para Assinatura Web3..."]);
              
              // 2. Chamar o EVM real. Alvo: Uniswap V2 Router (0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D) ou o Contrato Alvo identificado.
              const txParams = {
                  from: userAddress,
                  to: res.contract_target || '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
                  value: '0x0', // Arbitragem MEV envia Opcodes (data) transferindo tokens, logo valor nativo é 0.
                  data: '0x38ed1739', // Payload Placeholder: Método genérico EVM. (No ambiente full rodaríamos o hash de swapExactTokensForTokens)
              };

              const txHash = await (window as any).ethereum.request({
                  method: 'eth_sendTransaction',
                  params: [txParams],
              });
              
              setExecutionLog(prev => [...prev, `[PAYLOAD INJECTED] Transação On-Chain Enviada! Hash: ${txHash}`]);
          } catch(e: any) {
              setExecutionLog(prev => [...prev, `[ERROR] Operação de Extração Abortada (Assinatura Recusada / Falta de Fundos): ${e.message}`]);
          }
       } else {
          setExecutionLog(prev => [...prev, "[FATAL] Nenhuma carteira Web3 conectada no navegador (falta Metamask/Rabby).", "[FATAL] A extração real requer sua chave privada para assinar e pagar o Gás Eth da operação on-chain. Operação Abortada."]);
       }
     }, 2200);
  };

  // Carrega status inicial do backend caso já estivesse rodando
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/blockchain/autopilot');
        const data = await res.json();
        if (data.isRunning) {
          setIsAutoPilot(true);
          setResults(data.bounties || []);
        }
      } catch (e) {}
    };
    checkStatus();
  }, []);

  // Polling quando Auto-Pilot está ativado
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPilot) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/blockchain/autopilot');
          const data = await res.json();
          if (!data.isRunning) {
            setIsAutoPilot(false); // O script morreu por algum motivo
          } else {
            setResults(data.bounties || []);
          }
        } catch (e) {}
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPilot]);

  const toggleAutoPilot = async () => {
    const action = isAutoPilot ? 'stop' : 'start';
    if (!isAutoPilot) {
        setIsAutoPilot(true);
        setResults([]);
    } else {
        setIsAutoPilot(false);
    }
    
    try {
      await fetch('/api/blockchain/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
    } catch (e) {
      console.error("Falha ao comutar piloto automático:", e);
    }
  };

  const handleScan = async () => {
    if (!address) return;
    setIsScanning(true);
    setResults([]);
    try {
      const response = await fetch('/api/blockchain/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      const data = await response.json();
      if (data.success) setResults(data.opportunities || []);
    } catch (error) {
      console.error("Falha na conexão com o Hermes:", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px', gap: '16px', color: 'white' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-1px', textTransform: 'uppercase', margin: 0 }}>
            Arqueologia Digital
          </h1>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', margin: '4px 0 0 0' }}>
            Scanner de Ativos On-Chain e Valores Esquecidos
          </p>
        </div>
        
        {/* Toggle Auto-Pilot Global */}
        <button
          onClick={toggleAutoPilot}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', borderRadius: '14px', border: `1px solid ${isAutoPilot ? '#10b981' : 'rgba(255,255,255,0.1)'}`, background: isAutoPilot ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.5)', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          <Zap size={16} color={isAutoPilot ? "#34d399" : "rgba(255,255,255,0.4)"} className={isAutoPilot ? "animate-pulse" : ""} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: isAutoPilot ? '#34d399' : 'rgba(255,255,255,0.6)' }}>Piloto Automático</span>
            <span style={{ fontSize: '8px', color: isAutoPilot ? '#10b981' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{isAutoPilot ? 'Mass Scan Ativo' : 'Offline'}</span>
          </div>
        </button>
      </div>

      {/* Body: dois painéis lado a lado */}
      <div style={{ flex: 1, display: 'flex', gap: '24px', minHeight: 0, overflow: 'hidden' }}>
        
        {/* Coluna Esquerda */}
        <div style={{ width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          
          {/* Alvo de Varredura */}
          <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px', padding: '24px', opacity: isAutoPilot ? 0.4 : 1, pointerEvents: isAutoPilot ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Crosshair size={18} color="#a78bfa" />
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', color: 'rgba(255,255,255,0.6)' }}>Alvo de Varredura</span>
            </div>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '2px' }}>
              Endereço da Carteira / Contrato
            </label>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder="0x..."
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px 40px 12px 16px', fontSize: '13px', color: 'white', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
              />
              <Search size={16} color="rgba(255,255,255,0.2)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button
              onClick={handleScan}
              disabled={!address || isScanning}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px', cursor: address && !isScanning ? 'pointer' : 'not-allowed', background: address && !isScanning ? '#7c3aed' : 'rgba(255,255,255,0.05)', color: address && !isScanning ? 'white' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isScanning ? (
                <>
                  <div style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Escaneando Blocos...
                </>
              ) : 'Iniciar Varredura'}
            </button>
          </div>

          {/* Segurança Soberana */}
          <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Shield size={18} color="#34d399" />
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(52,211,153,0.6)' }}>Segurança Soberana</span>
            </div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6', margin: 0 }}>
              O Hermes nunca solicita suas chaves privadas. O resgate de fundos é feito através de interfaces oficiais ou gerando dados de transação para assinatura manual externa.
            </p>
          </div>

          {/* Protocolos Monitorados */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Activity size={18} color="#60a5fa" />
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)' }}>Protocolos Monitorados</span>
            </div>
            {['Stargate Finance', 'Hop Protocol', 'Polygon Bridge', '1inch Orders'].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: (isScanning || isAutoPilot) ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', transition: 'color 0.3s' }}>{p}</span>
                {(isScanning || isAutoPilot) ? (
                  <div style={{ width: '10px', height: '10px', border: '2px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                ) : (
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.8)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Coluna Direita - Resultados - ocupa todo espaço restante */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
            
            {/* Header do painel */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Activity size={20} color="#f43f5e" />
                <h2 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '4px', margin: 0 }}>{isAutoPilot ? 'Central de Operações MEV' : 'Alvos Investigados'}</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {isAutoPilot && (
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f43f5e', animation: 'pulse 1.5s infinite' }} />
                )}
                <Clock size={12} color="rgba(255,255,255,0.3)" />
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px' }}>{isAutoPilot ? 'Snifando Contratos' : 'Standby'}</span>
              </div>
            </div>

            {/* Lista de resultados - ocupa espaço restante */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {results.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                  <AlertCircle size={48} style={{ marginBottom: '16px' }} />
                  <p style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', margin: 0, textAlign: 'center' }}>
                    {isAutoPilot ? 'Aguardando o Scanner detectar vulnerabilidades...' : 'Nenhum contato on-chain no momento.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {results.slice(0, 10).map((res, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: res.asset === 'Exploit' ? '1px solid rgba(244,63,94,0.3)' : '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}
                    >
                      {/* Top Row: Info */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: res.asset === 'Exploit' ? 'rgba(244,63,94,0.1)' : 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: res.asset === 'Exploit' ? '1px solid rgba(244,63,94,0.2)' : '1px solid rgba(139,92,246,0.2)' }}>
                            <Zap size={14} color={res.asset === 'Exploit' ? "#f43f5e" : "#a78bfa"} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'white' }}>{res.protocol}</span>
                              <span style={{ fontSize: '8px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>{res.network}</span>
                              {res.level && (
                                <span style={{ fontSize: '8px', padding: '2px 6px', borderRadius: '4px', background: res.level === 'CRITICAL' ? '#f43f5e' : '#f59e0b', color: 'white', fontWeight: 900, textTransform: 'uppercase' }}>
                                    {res.level}
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', margin: 0, marginTop: '4px' }}>{res.action || "Saldo Encontrado"}</p>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: res.status === 'Vulnerable' ? '#f43f5e' : '#10b981', display: 'block' }}>{res.status}</span>
                          <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', marginTop: '2px', display: 'block' }}>
                              Tx: {res.trigger_tx ? `${res.trigger_tx.slice(0,6)}...${res.trigger_tx.slice(-4)}` : (res.tx ? `${res.tx.slice(0,6)}...` : 'N/A')}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row: Profit & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                           <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>{res.asset === 'Exploit' ? 'Lucro Estimado' : 'Valor Captado'}</span>
                           <p style={{ fontSize: '16px', fontWeight: 900, color: res.asset === 'Exploit' ? '#f43f5e' : '#34d399', margin: 0 }}>{res.amount}</p>
                        </div>
                        <button onClick={() => handleExecute(res)} style={{ padding: '8px 16px', borderRadius: '8px', background: res.asset === 'Exploit' ? '#e11d48' : '#7c3aed', border: 'none', color: 'white', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.3s' }}>
                          <Activity size={12} />
                          Executar Extração
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Execução On-Chain */}
      {isInjecting && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: '600px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '16px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
               <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Zap size={16} /> Sequência de Extração MEV
               </h3>
               <button onClick={() => setIsInjecting(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>X</button>
            </div>
            
            <div style={{ background: 'black', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: '#10b981', minHeight: '150px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {executionLog.map((log, idx) => (
                <div key={idx} style={{ color: log.includes('[FATAL]') || log.includes('[ERROR]') ? '#ef4444' : (log.includes('[SYS]') ? '#a78bfa' : '#34d399') }}>
                  {log}
                </div>
              ))}
              {executionLog.length > 0 && !executionLog[executionLog.length - 1].includes('[FATAL]') && !executionLog[executionLog.length - 1].includes('[ERROR]') && !executionLog[executionLog.length - 1].includes('[SUCCESS]') && (
                <div style={{ animation: 'pulse 1s infinite' }}>_</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

