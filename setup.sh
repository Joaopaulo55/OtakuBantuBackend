#!/bin/bash

echo "🔵 Iniciando setup do projeto no Render..."

# Configura ambiente
set -e  # Exit immediately if a command exits with a non-zero status

# Configura Node.js e npm
echo "📦 Configurando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale Node.js antes de continuar."
    exit 1
fi

echo -n "Node: "; node -v
echo -n "NPM: "; npm -v

# Instala dependências do Node
echo "📦 Instalando dependências do Node.js..."
npm install || { 
    echo "❌ Falha ao instalar dependências Node"; 
    exit 1; 
}

# Verifica instalações importantes
echo "✅ Verificando instalações:"
echo -n "Express: "; npm list express > /dev/null && echo "✓" || echo "❌"
echo -n "Axios: "; npm list axios > /dev/null && echo "✓" || echo "❌"
echo -n "CORS: "; npm list cors > /dev/null && echo "✓" || echo "❌"

# Cria arquivo de ambiente se não existir
echo "📄 Criando arquivo .env (se necessário)..."
if [ ! -f ".env" ]; then
    touch .env
    echo "PORT=5000" >> .env
    echo "✓ Arquivo .env criado com configuração básica"
else
    echo "✓ Arquivo .env já existe"
fi

echo "🚀 Setup concluído com sucesso!"
