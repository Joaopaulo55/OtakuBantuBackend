const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const BASE_URL = 'https://animefire.plus';

// 🔥 Página inicial
app.get('/', (req, res) => {
  res.send('🔥 OtakuBantu Backend usando AnimeFire.plus');
});

// ✅ POPULARES / ANIMES ATUALIZADOS
app.get('/animefire/populares', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/animes-atualizados`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const animes = [];

    $('.anime-card-container').each((i, el) => {
      const title = $(el).find('.anime-card-title').text().trim();
      const url = BASE_URL + $(el).find('a').attr('href');
      const thumb = $(el).find('img').attr('src');
      animes.push({ title, url, thumb });
    });

    res.json({ resultados: animes });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ erro: 'Erro ao obter populares' });
  }
});

// 🔍 BUSCA POR NOME
app.get('/animefire/buscar/:termo', async (req, res) => {
  try {
    const termo = req.params.termo;
    const { data } = await axios.get(`${BASE_URL}/pesquisar/${encodeURIComponent(termo)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(data);
    const resultados = [];

    $('.anime-card-container').each((i, el) => {
      const title = $(el).find('.anime-card-title').text().trim();
      const url = BASE_URL + $(el).find('a').attr('href');
      const thumb = $(el).find('img').attr('src');
      resultados.push({ title, url, thumb });
    });

    res.json({ resultados });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ erro: 'Erro ao buscar anime' });
  }
});

// ▶️ LISTAR TODOS OS EPISÓDIOS DE UM ANIME
app.get('/animefire/assistir/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const { data } = await axios.get(`${BASE_URL}/animes/${slug}-todos-os-episodios`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(data);
    const episodios = [];

    $('.episodes .episodes-list a').each((i, el) => {
      const epTitle = $(el).text().trim();
      const epUrl = $(el).attr('href');
      const epNum = epUrl.split('/').pop();
      episodios.push({ epTitle, epNum });
    });

    res.json({ episodios });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ erro: 'Erro ao obter episódios' });
  }
});

// ▶️ PEGAR IFRAME DO EPISÓDIO SELECIONADO
app.get('/animefire/player/:slug/:ep', async (req, res) => {
  try {
    const { slug, ep } = req.params;
    const { data } = await axios.get(`${BASE_URL}/animes/${slug}/${ep}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(data);
    const iframe = $('iframe').first().attr('src');

    res.json({ player: iframe });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ erro: 'Erro ao obter player do episódio' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ OtakuBantu Backend rodando na porta ${PORT}`);
});
