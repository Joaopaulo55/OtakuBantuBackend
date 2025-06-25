// OtakuBantu Backend com API real (Consumet/GogoAnime)
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const BASE_URL = 'https://api.consumet.org/anime/gogoanime';

// Buscar animes
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Query ausente.' });

  try {
    const response = await fetch(`${BASE_URL}/${encodeURIComponent(query)}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar animes.', details: err.message });
  }
});

// Detalhes do anime
app.get('/anime/:id', async (req, res) => {
  const animeId = req.params.id;

  try {
    const response = await fetch(`${BASE_URL}/info/${animeId}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar detalhes do anime.', details: err.message });
  }
});

// Episódio (video player)
app.get('/watch/:id', async (req, res) => {
  const episodeId = req.params.id;

  try {
    const response = await fetch(`${BASE_URL}/watch/${episodeId}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar episódio.', details: err.message });
  }
});

// Rota para obter animes populares
app.get('/popular', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/popular`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar animes populares.', details: err.message });
  }
});

// Rota para obter episódios recentes
app.get('/recent', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/recent-episodes`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar episódios recentes.', details: err.message });
  }
});

// Início do servidor
app.listen(PORT, () => {
  console.log(`OtakuBantu API rodando na porta ${PORT}`);
});