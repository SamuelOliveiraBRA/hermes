import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const agentDir = path.resolve(process.cwd(), '../agent');
const LOCK_FILE = path.join(agentDir, 'hunter.lock');
const BOUNTY_FILE = path.join(agentDir, 'hermes_bounty.json');

export async function GET() {
  try {
    const isRunning = fs.existsSync(LOCK_FILE);
    let bounties = [];
    
    if (fs.existsSync(BOUNTY_FILE)) {
      const data = fs.readFileSync(BOUNTY_FILE, 'utf8');
      if (data) {
        bounties = JSON.parse(data);
      }
    }
    
    return NextResponse.json({ 
        isRunning, 
        bounties,
        timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action } = await req.json(); // "start" or "stop"
    
    if (action === 'start') {
        if (fs.existsSync(LOCK_FILE)) {
            return NextResponse.json({ success: true, message: "Já está rodando." });
        }
        
        // Em um ambiente de produção real, usaríamos um gerenciador de processos como PM2 ou um background worker.
        const pythonBin = path.join(agentDir, 'venv', 'bin', 'python3');
        const out = fs.openSync(path.join(agentDir, 'hunter.log'), 'a');
        const err = fs.openSync(path.join(agentDir, 'hunter.err'), 'a');
        
        const child = spawn(pythonBin, ['hermes_auto_hunter.py'], {
            cwd: agentDir,
            detached: true,
            stdio: ['ignore', out, err], // grava os logs em arquivos
            env: { ...process.env, PYTHONPATH: agentDir }
        });
        
        child.unref(); // Desvincula para continuar vivo
        
        // Pequeno atraso para garantir que o script subiu e criou o lock file
        await new Promise(r => setTimeout(r, 1000));
        
        return NextResponse.json({ success: true, message: "Auto-Piloto ativado no background." });
        
    } else if (action === 'stop') {
        if (fs.existsSync(LOCK_FILE)) {
            fs.unlinkSync(LOCK_FILE);
            // O hunter_loop vai identificar que o lock sumiu na proxima iteração e morrer
            return NextResponse.json({ success: true, message: "Auto-Piloto desligado." });
        }
        return NextResponse.json({ success: true, message: "Já estava desligado." });
    }
    
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });

  } catch (error: any) {
    console.error("Erro na API AutoPilot:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
