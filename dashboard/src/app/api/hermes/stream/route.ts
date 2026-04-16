import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

import { execSync } from 'child_process';

const LOG_FILE = path.join(os.homedir(), 'Documents/Hermes/logs/hermes_brain.jsonl');

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      if (!fs.existsSync(LOG_FILE)) {
        // Cria o arquivo se não existir para evitar erro de leitura
        fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
        fs.writeFileSync(LOG_FILE, '');
      }

      const sendEvent = (dataStr: string) => {
        try {
          const data = JSON.parse(dataStr);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          // Ignora linhas malformadas
        }
      };

      const sendTelemetry = () => {
        const cpuLoad = os.loadavg()[0];
        let usedMemPercent = 0;
        
        try {
          // No macOS, o os.freemem() é impreciso pois ignora cache/inativo.
          // Usamos a pressão de memória do sistema para um valor real.
          const output = execSync("memory_pressure | grep 'System-wide memory free percentage' | awk '{print $NF}' | tr -d '%'").toString();
          const freePercent = parseInt(output.trim());
          usedMemPercent = 100 - freePercent;
        } catch (e) {
          const totalMem = os.totalmem();
          const freeMem = os.freemem();
          usedMemPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);
        }
        
        const telemetry = {
          type: 'telemetry',
          cpu: cpuLoad.toFixed(2),
          ram: usedMemPercent,
          timestamp: new Date().toLocaleTimeString('pt-BR')
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(telemetry)}\n\n`));
      };

      // --- Tailing do Arquivo de Log ---
      let lastSize = 0;
      let tick = 0;
      const interval = setInterval(() => {
        try {
          // Enviar telemetria a cada 2 segundos (10 ticks de 200ms)
          if (tick % 10 === 0) sendTelemetry();
          tick++;

          const stats = fs.statSync(LOG_FILE);

          // Detecta se o arquivo foi truncado (nova sessão do agente)
          // e reseta o ponteiro de leitura
          if (stats.size < lastSize) {
            lastSize = 0;
          }

          if (stats.size > lastSize) {
            const fileStream = fs.createReadStream(LOG_FILE, { start: lastSize });
            fileStream.on('data', (chunk) => {
              const lines = chunk.toString().split('\n').filter(Boolean);
              lines.forEach(sendEvent);
            });
            lastSize = stats.size;
          }
        } catch (e) {
          clearInterval(interval);
          controller.close();
        }
      }, 200);

      // Limpar intervalo ao fechar a conexão
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
