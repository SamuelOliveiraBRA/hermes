import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const userPrompt = body.prompt || "Organize minhas fotos";

  const AGENT_PATH = path.join(os.homedir(), 'Documents/Hermes/agent/organizer_agent.py');
  const LOG_FILE = path.join(os.homedir(), 'Documents/Hermes/logs/hermes_brain.jsonl');
  // Sempre usa o Python do venv que tem todas as dependências (web3, ollama, etc.)
  const VENV_PYTHON = path.join(os.homedir(), 'Documents/Hermes/agent/venv/bin/python3');

  // Garante que o diretório de logs existe
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });

  // Limpa o log anterior para começar uma nova sessão limpa no Dashboard
  fs.writeFileSync(LOG_FILE, '');

  // Verifica se o venv existe
  if (!fs.existsSync(VENV_PYTHON)) {
    console.error('ERRO: venv Python não encontrado em', VENV_PYTHON);
    return NextResponse.json({ success: false, error: 'venv não encontrado' }, { status: 500 });
  }

  console.log(`Iniciando Agente Hermes com venv: ${VENV_PYTHON}`);
  console.log(`Prompt: "${userPrompt}"`);

  const ERROR_LOG = path.join(os.homedir(), 'Documents/Hermes/logs/agent_error.log');
  // Rotaciona o log de erros para cada sessão
  fs.writeFileSync(ERROR_LOG, '');
  const errorFile = fs.openSync(ERROR_LOG, 'a');

  // Dispara o processo usando SEMPRE o Python do venv
  const child = spawn(VENV_PYTHON, [AGENT_PATH, userPrompt], {
    detached: true,
    stdio: ['ignore', 'ignore', errorFile],
    cwd: path.join(os.homedir(), 'Documents/Hermes/agent'),
    env: { 
      ...process.env, 
      PYTHONUNBUFFERED: '1',
      // Garante que o PATH inclui o venv
      PATH: `${path.join(os.homedir(), 'Documents/Hermes/agent/venv/bin')}:${process.env.PATH}`
    }
  });

  child.unref();

  return NextResponse.json({ 
    success: true, 
    message: "Agente Hermes despertado para a missão!",
    pid: child.pid,
    python: VENV_PYTHON
  });
}
