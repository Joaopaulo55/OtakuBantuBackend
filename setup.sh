#!/bin/bash

# OtakuBantu API Setup Script
echo "🔄 Starting OtakuBantu API setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher and try again."
    echo "🔗 Download Node.js from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Your Node.js version is too old. Please upgrade to Node.js v16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Create project directory if it doesn't exist
PROJECT_DIR="otakubantu-api"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "📂 Creating project directory..."
    mkdir "$PROJECT_DIR"
fi

cd "$PROJECT_DIR" || exit

# Create necessary files if they don't exist
if [ ! -f "server.js" ]; then
    echo "📝 Creating server.js..."
    cat > server.js << 'EOL'
// server.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());

const PORT = process.env.PORT || 8080;

// Utilitário para traduzir (usando LibreTranslate público ou local)
async function traduzirTexto(texto, alvo = 'pt') {
  try {
    const res = await axios.post('https://libretranslate.com/translate', {
      q: texto,
      source: 'en',
      target: alvo,
      format: 'text'
    });
    return res.data.translatedText;
  } catch {
    return texto; // fallback
  }
}

// 🎌 Lista de animes populares
app.get('/api/populares', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.jikan.moe/v4/top/anime');
    const lista = await Promise.all(data.data.map(async anime => ({
      titulo: anime.title,
      sinopse: await traduzirTexto(anime.synopsis || 'Sem sinopse'),
      imagem: anime.images.jpg.image_url,
      tipo: anime.type,
      episódios: anime.episodes,
      status: anime.status
    })));
    res.json(lista);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar animes populares' });
  }
});

// 🔮 Animes por gênero e dia
app.get('/api/recomendados', async (req, res) => {
  const dia = new Date().getDay(); // 5 = sexta
  const genero = req.query.genero || (dia === 5 ? 'isekai' : 'action');

  try {
    const { data } = await axios.get(`https://api.jikan.moe/v4/anime?genres=${genero}&order_by=score`);
    const recomendados = await Promise.all(data.data.slice(0, 10).map(async anime => ({
      titulo: anime.title,
      sinopse: await traduzirTexto(anime.synopsis || 'Sem sinopse'),
      imagem: anime.images.jpg.image_url,
      status: anime.status,
    })));
    res.json({
      dia_da_semana: dia,
      foco: dia === 5 ? 'Sexta Isekai' : 'Recomendações do dia',
      genero_recomendado: genero,
      recomendados
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro nas recomendações' });
  }
});

// 📰 Notícias Anime (usando Google News PT RSS)
const Parser = require('rss-parser');
const parser = new Parser();

app.get('/api/noticias', async (req, res) => {
  try {
    const feed = await parser.parseURL('https://news.google.com/rss/search?q=anime&hl=pt-PT&gl=PT&ceid=PT:pt-150');
    const noticias = feed.items.slice(0, 10).map(n => ({
      titulo: n.title,
      link: n.link,
      resumo: n.contentSnippet
    }));
    res.json(noticias);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar notícias' });
  }
});

// 🔔 Lançamentos futuros
app.get('/api/lancamentos', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.jikan.moe/v4/seasons/upcoming');
    const futuros = await Promise.all(data.data.slice(0, 10).map(async anime => ({
      titulo: anime.title,
      sinopse: await traduzirTexto(anime.synopsis || 'Sem sinopse'),
      estreia: anime.aired?.from?.split('T')[0],
      imagem: anime.images.jpg.image_url
    })));
    res.json(futuros);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar lançamentos' });
  }
});

// ✅ Server rodando
app.listen(PORT, () => {
  console.log(`OtakuBantu API rodando na porta ${PORT}`);
});
EOL
fi

if [ ! -f "package.json" ]; then
    echo "📝 Creating package.json..."
    cat > package.json << 'EOL'
{
  "name": "otakubantu-server",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "axios": "^1.6.8",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "rss-parser": "^3.12.0"
  }
}
EOL
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Fix any vulnerabilities
echo "🔒 Checking for vulnerabilities..."
npm audit fix

echo "✅ Setup completed successfully!"
echo "🚀 To start the server, run:"
echo "   cd $PROJECT_DIR && npm start"
echo ""
echo "🌐 The API will be available at: http://localhost:8080"
