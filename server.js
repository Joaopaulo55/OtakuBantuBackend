// server.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

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