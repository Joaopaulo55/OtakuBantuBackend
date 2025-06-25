#!/bin/bash

echo "🔵 Iniciando setup do projeto OtakuBantu no Render..."

# Configura ambiente
set -e  # Exit immediately if a command exits with a non-zero status

# Verifica Node.js e npm
echo "📦 Verificando Node.js e npm..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale Node.js v16+ antes de continuar."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Versão do Node.js ($(node -v)) é muito antiga. Necessário Node.js v16+."
    exit 1
fi

echo -n "✔ Node: "; node -v
echo -n "✔ NPM: "; npm -v

# Instala dependências do Node
echo "📦 Instalando dependências do Node.js..."
echo "🔹 Dependências principais (express, node-fetch, cors)"
npm install express@4.18.2 node-fetch@2.6.7 cors@2.8.5 --save || { 
    echo "❌ Falha ao instalar dependências principais"; 
    exit 1; 
}

echo "🔹 Dependências de desenvolvimento (nodemon, eslint, jest)"
npm install nodemon@3.0.2 eslint@8.56.0 jest@29.7.0 --save-dev || {
    echo "⚠️ Falha ao instalar dependências de desenvolvimento (continuando...)"
}

# Verifica instalações
echo "✅ Verificando instalações:"
check_dependency() {
    if npm list "$1" > /dev/null 2>&1; then
        echo "✔ $1 instalado"
    else
        echo "❌ $1 não instalado corretamente"
        exit 1
    fi
}

check_dependency "express"
check_dependency "node-fetch"
check_dependency "cors"

# Configura ESLint
echo "🔧 Configurando ESLint..."
if [ ! -f ".eslintrc.json" ]; then
    cat > .eslintrc.json <<EOL
{
  "extends": "airbnb-base",
  "rules": {
    "no-console": "off",
    "import/no-extraneous-dependencies": ["error", {"devDependencies": true}]
  },
  "env": {
    "node": true,
    "jest": true
  }
}
EOL
    echo "✔ Arquivo .eslintrc.json criado"
else
    echo "✓ Arquivo .eslintrc.json já existe"
fi

# Cria arquivo de ambiente
echo "📄 Criando arquivo .env..."
if [ ! -f ".env" ]; then
    cat > .env <<EOL
# Configurações do servidor
PORT=3000

# Configurações da API Consumet
CONSUMET_BASE_URL=https://api.consumet.org/anime/gogoanime

# Configurações de cache (em segundos)
CACHE_TTL=3600
EOL
    echo "✔ Arquivo .env criado com configurações básicas"
else
    echo "✓ Arquivo .env já existe"
fi

# Cria diretório de logs se não existir
mkdir -p logs

echo "🚀 Setup concluído com sucesso!"
echo "👉 Você pode iniciar o servidor com:"
echo "   - npm run dev (para desenvolvimento com nodemon)"
echo "   - npm start (para produção)"
