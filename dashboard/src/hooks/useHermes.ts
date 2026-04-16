"use client";

import { useState, useEffect } from 'react';
import { Database, Terminal, Activity } from 'lucide-react';

export interface Thought {
  timestamp: string;
  message: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface HermesAction {
  icon: any;
  label: string;
  action: string;
  time: string;
}

export const useHermes = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [actions, setActions] = useState<HermesAction[]>([]);
  const [telemetry, setTelemetry] = useState({ cpu: "0.00", ram: 0 });
  const [isStarting, setIsStarting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Carrega hist\u00f3rico local no in\u00edcio
  useEffect(() => {
    const saved = localStorage.getItem('hermes_messages');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  // Salva hist\u00f3rico sempre que mudar
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('hermes_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const eventSource = new EventSource('/api/hermes/stream');
    let thinkingTimeout: NodeJS.Timeout;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Sempre que recebemos algo, o Hermes está "pensando"
      setIsThinking(true);
      clearTimeout(thinkingTimeout);
      
      // Se ficar 5 segundos sem emitir nada (pensamento ou ação), ele volta para o modo ocioso
      thinkingTimeout = setTimeout(() => {
        setIsThinking(false);
      }, 5000);

      if (data.type === 'thought') {
        const msg = data.message || '';
        
        // Se for uma resposta final dirigida ao usuário, vira uma mensagem de chat
        if (msg.includes('[Hermes]:')) {
          const content = msg.replace('[Hermes]:', '').trim();

          // Filtra respostas inválidas: null, undefined, vazias, ou muito curtas
          const isInvalid = !content
            || content.toLowerCase() === 'null'
            || content.toLowerCase() === 'undefined'
            || content.length < 2;

          if (isInvalid) return; // Descarta silenciosamente

          setMessages(prev => {
            // Evita duplicidade se o log for lido múltiplas vezes
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content === content) return prev;
            
            return [...prev, {
              role: 'assistant',
              content,
              timestamp: data.timestamp || new Date().toLocaleTimeString()
            }];
          });
          setIsThinking(false);
        } else {
          // Senão, é apenas um pensamento técnico para o box de "Thinking"
          setThoughts(prev => [...prev, { timestamp: data.timestamp, message: msg }].slice(-10));
        }
      } else if (data.type === 'action') {
        setActions(prev => {
          if (prev.length > 0 && prev[0].label === (data.file || 'Processo')) {
            const updated = [...prev];
            updated[0] = { ...updated[0], action: data.status, time: data.timestamp };
            return updated;
          }
          return [{
            icon: data.status === 'Reading' ? Database : Terminal,
            label: data.file || 'Processo',
            action: data.status,
            time: data.timestamp
          }, ...prev].slice(0, 5);
        });
      } else if (data.type === 'telemetry') {
        setTelemetry({ cpu: data.cpu, ram: data.ram });
      }
    };

    return () => eventSource.close();
  }, []);

  const startMission = async (command: string) => {
    if (!command.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: command,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsStarting(true);
    setIsThinking(true);
    setThoughts([]);
    
    try {
      const response = await fetch('/api/hermes/start', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: command })
      });
      
      // Aqui o sistema de streaming vai alimentar as respostas (assistant) via EventSource
    } catch (e) {
      console.error("Erro ao iniciar Hermes:", e);
    } finally {
      setTimeout(() => setIsStarting(false), 2000);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('hermes_messages');
  };

  return {
    messages,
    thoughts,
    actions,
    telemetry,
    isStarting,
    isThinking,
    startMission,
    clearChat
  };
};
