FROM ubuntu:22.04

# Configurações para instalação silenciosa e produção
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

# Instalar Kernel do sistema (Python, Node, bibliotecas de compilação)
RUN apt-get update && apt-get install -y \
    curl \
    python3.10 \
    python3.10-venv \
    python3-pip \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar todo o arsenal (código-fonte)
COPY . .

# Configurar o Backend (Motor Web3 em Python)
RUN python3.10 -m venv /app/agent/venv
RUN /app/agent/venv/bin/pip install --upgrade pip
RUN /app/agent/venv/bin/pip install -r /app/agent/requirements.txt

# Configurar o Frontend (Dashboard React/Next.js)
WORKDIR /app/dashboard
# Remove a telemetria do Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install
RUN npm run build

EXPOSE 3000

# Inicializa o Servidor do Painel (que gerenciará o Motor Python)
CMD ["npm", "run", "start"]
