// server.js atualizado (mirror como primário + fallback AnimeFire completo)
const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cors = require('cors');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3000;

const PRIMARY_BASE = 'https://consumet-api-fawn.vercel.app/anime/gogoanime';
const MIRROR_BASE = 'https://api.consumet.org/anime/gogoanime';
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutos

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Limite de requisições excedido. Tente novamente mais tarde.'
});
app.use(limiter);

async function fetchWithFallback(urlPath) {
  try {
    const res = await fetch(`${PRIMARY_BASE}${urlPath}`);
    if (!res.ok) throw new Error('Primário falhou');
    return await res.json();
  } catch (err) {
    console.warn('Primário falhou. Tentando o espelho...');
    const res2 = await fetch(`${MIRROR_BASE}${urlPath}`);
    if (!res2.ok) throw new Error('Espelho falhou também');
    return await res2.json();
  }
}

async function fallbackFromAnimeFirePage(title) {
  try {
    const searchURL = `https://animefire.plus/busca?q=${encodeURIComponent(title)}`;
    const html = await fetch(searchURL).then(r => r.text());
    const $ = cheerio.load(html);

    const animes = [];
    $('.anime__item').each((i, el) => {
      const name = $(el).find('.anime__title').text().trim();
      const thumb = $(el).find('img').attr('src');
      const link = $(el).find('a').attr('href');
      animes.push({ name, thumb, link: `https://animefire.plus${link}` });
    });

    return { fallback: true, provider: 'animefire', results: animes };
  } catch (e) {
    return { fallback: true, provider: 'animefire', results: [] };
  }
}

function logError(message) {
  const log = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync('logs.txt', log);
}

app.get('/fallback-animefire', async (req, res) => {
  const title = req.query.q;
  if (!title) return res.status(400).json({ error: 'Query ausente.' });
  const result = await fallbackFromAnimeFirePage(title);
  res.json(result);
});

app.get('/search', async (req, res) => {
  const query = req.query.q;
  const page = req.query.page || 1;
  if (!query) return res.status(400).json({ error: 'Query ausente.' });

  const cacheKey = `search-${query}-page-${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const data = await fetchWithFallback(`/${encodeURIComponent(query)}?page=${page}`);
    cache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    logError('Erro /search: ' + err.message);
    res.status(500).json({ error: 'Erro ao buscar animes.', details: err.message });
  }
});

app.get('/popular', async (req, res) => {
  const cacheKey = `popular`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const data = await fetchWithFallback(`/popular`);
    cache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    logError('Erro /popular: ' + err.message);
    res.status(500).json({ error: 'Erro ao buscar animes populares.', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`OtakuBantu API rodando na porta ${PORT}`);
});
