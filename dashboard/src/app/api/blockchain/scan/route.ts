import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    
    if (!address) {
      return NextResponse.json({ error: "Endere\u00e7o n\u00e3o fornecido" }, { status: 400 });
    }

    // Executa o script Python do Agente Hermes para varredura real
    // Samuel, note que estamos chamando o m\u00e9todo de varredura global real aqui
    const pythonScript = `python3 -c "from hermes_blockchain_eye import BlockchainEye; import json; eye = BlockchainEye(); print(json.dumps(eye.auto_scan_all('${address}')))"`;
    
    const { stdout, stderr } = await execPromise(pythonScript, {
        env: { ...process.env, PYTHONPATH: process.cwd() + "/../agent" }
    });

    if (stderr && !stdout) {
      console.error("Erro no motor Python:", stderr);
      return NextResponse.json({ error: "Erro na varredura on-chain" }, { status: 500 });
    }

    const opportunities = JSON.parse(stdout);

    return NextResponse.json({ 
        success: true, 
        opportunities,
        timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Erro na API de Blockchain:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
