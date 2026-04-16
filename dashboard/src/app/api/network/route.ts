import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  // Caminho absoluto para a memória do Agente no Mac Mini M4
  const memoryPath = '/Users/samuel.oliveirabra/Documents/Hermes/agent/memory/network_assets.json';

  try {
    if (fs.existsSync(memoryPath)) {
      const data = fs.readFileSync(memoryPath, 'utf8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json({ devices: [], status: 'no_data' });
  } catch (error) {
    console.error('Erro ao ler ativos de rede:', error);
    return NextResponse.json({ error: 'Falha ao acessar memória de rede' }, { status: 500 });
  }
}
