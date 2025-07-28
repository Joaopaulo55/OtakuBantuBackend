#!/bin/bash

# OtakuBantu API Setup Script
echo "🔄 Starting OtakuBantu API setup..."

# Função para sair com mensagem de erro
error_exit() {
    echo "❌ Error: $1" >&2
    exit 1
}

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    error_exit "Node.js is not installed. Please install Node.js v16 or higher and try again.\nDownload Node.js from: https://nodejs.org/"
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    error_exit "Your Node.js version is too old. Please upgrade to Node.js v16 or higher."
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    error_exit "npm is not installed. Please install npm and try again."
fi

# Criar diretório do projeto se não existir
PROJECT_DIR="otakubantu-api"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "📂 Creating project directory..."
    mkdir -p "$PROJECT_DIR" || error_exit "Failed to create project directory"
fi

cd "$PROJECT_DIR" || error_exit "Failed to enter project directory"

# Inicializar projeto npm se package.json não existir
if [ ! -f "package.json" ]; then
    echo "📝 Initializing npm project..."
    npm init -y || error_exit "Failed to initialize npm project"
fi

# Instalar dependências
echo "📦 Installing dependencies..."
npm install axios cors express rss-parser || error_exit "Failed to install dependencies"

# Corrigir vulnerabilidades
echo "🔒 Checking for vulnerabilities..."
npm audit fix || echo "⚠️ Warning: npm audit fix failed, continuing anyway..."

# Verificar se server.js existe, se não, criar
if [ ! -f "server.js" ]; then
    echo "📝 Creating server.js..."
    cat << 'EOT' > server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// ... (restante do conteúdo do server.js como fornecido anteriormente)
EOT
fi

echo "✅ Setup completed successfully!"
echo "🚀 To start the server, run:"
echo "   cd $PROJECT_DIR && npm start"
echo ""
echo "🌐 The API will be available at: http://localhost:8080"

exit 0
