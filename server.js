// OtakuBantu Backend com fallback, cache, rate limit e múltiplas origens
const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cors = require('cors');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3000;

const PRIMARY_BASE = 'https://api.consumet.org/anime/gogoanime';
const MIRROR_BASE = 'https://consumet-api-fawn.vercel.app/anime/gogoanime';
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutos

app.use(cors());
app.use(express.json());

// Limite de requisições por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Limite de requisições excedido. Tente novamente mais tarde.'
});
app.use(limiter);

// Função com fallback entre BASEs
async function fetchWithFallback(urlPath) {
  try {
    const res = await fetch(`${PRIMARY_BASE}${urlPath}`);
    if (!res.ok) throw new Error('Primário falhou');
    return await res.json();
  } catch (err) {
    console.warn('⚠️ Primário falhou. Tentando o mirror...');
    const res2 = await fetch(`${MIRROR_BASE}${urlPath}`);
    if (!res2.ok) throw new Error('Mirror falhou também');
    return await res2.json();
  }
}

// Fallbacks para fontes alternativas
async function fallbackFromAnimeFire(episodeId) {
  try {
    const url = `https://animefire.plus/episodio/${episodeId}`;
    const html = await fetch(url).then(res => res.text());
    const $ = cheerio.load(html);
    const sources = [];

    $('source').each((i, el) => {
      sources.push({
        quality: $(el).attr('label') || 'Desconhecida',
        url: $(el).attr('src')
      });
    });

    return { fallback: true, provider: 'animefire', sources };
  } catch (e) {
    console.error('Erro no fallback Anime Fire:', e.message);
    return { fallback: true, provider: 'animefire', sources: [] };
  }
}

async function fallbackFromGoyabu(episodeId) {
  try {
    const url = `https://goyabu.to/episodio/${episodeId}`;
    const html = await fetch(url).then(res => res.text());
    const $ = cheerio.load(html);
    const sources = [];

    $('video source').each((i, el) => {
      sources.push({
        quality: $(el).attr('label') || 'Desconhecida',
        url: $(el).attr('src')
      });
    });

    return { fallback: true, provider: 'goyabu', sources };
  } catch (e) {
    return { fallback: true, provider: 'goyabu', sources: [] };
  }
}

async function fallbackFromAnimeVibe(episodeId) {
  try {
    const url = `https://animevibe.dev/watch/${episodeId}`;
    const html = await fetch(url).then(res => res.text());
    const $ = cheerio.load(html);
    const sources = [];

    $('video source').each((i, el) => {
      sources.push({
        quality: $(el).attr('res') || 'Desconhecida',
        url: $(el).attr('src')
      });
    });

    return { fallback: true, provider: 'animevibe', sources };
  } catch (e) {
    return { fallback: true, provider: 'animevibe', sources: [] };
  }
}

function logError(message) {
  const log = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync('logs.txt', log);
}

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

app.get('/genre/:genre', async (req, res) => {
  const genre = req.params.genre.toLowerCase();
  const page = req.query.page || 1;
  const cacheKey = `genre-${genre}-page-${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const data = await fetchWithFallback(`?page=${page}`);
    const filtered = data.results.filter(anime => anime.genres?.map(g => g.toLowerCase()).includes(genre));
    cache.set(cacheKey, { results: filtered });
    res.json({ results: filtered });
  } catch (err) {
    logError('Erro /genre/:genre: ' + err.message);
    res.status(500).json({ error: 'Erro ao buscar por gênero.', details: err.message });
  }
});

app.get('/anime/:id', async (req, res) => {
  const animeId = req.params.id;
  const cacheKey = `anime-${animeId}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const data = await fetchWithFallback(`/info/${animeId}`);
    cache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    logError('Erro /anime/:id: ' + err.message);
    res.status(500).json({ error: 'Erro ao buscar detalhes do anime.', details: err.message });
  }
});

app.get('/watch/:id', async (req, res) => {
  const episodeId = req.params.id;
  const cacheKey = `watch-${episodeId}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const data = await fetchWithFallback(`/watch/${episodeId}`);

    if (!data.sources || data.sources.length === 0) {
      const fallback = await fallbackFromAnimeFire(episodeId);
      if (fallback.sources.length === 0) {
        const altFallback = await fallbackFromGoyabu(episodeId);
        if (altFallback.sources.length === 0) {
          const vibeFallback = await fallbackFromAnimeVibe(episodeId);
          cache.set(cacheKey, vibeFallback);
          return res.json(vibeFallback);
        }
        cache.set(cacheKey, altFallback);
        return res.json(altFallback);
      }
      cache.set(cacheKey, fallback);
      return res.json(fallback);
    }

    cache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    logError('Erro /watch/:id: ' + err.message);
    const fallback = await fallbackFromAnimeFire(episodeId);
    if (fallback.sources.length === 0) {
      const altFallback = await fallbackFromGoyabu(episodeId);
      if (altFallback.sources.length === 0) {
        const vibeFallback = await fallbackFromAnimeVibe(episodeId);
        cache.set(cacheKey, vibeFallback);
        return res.json(vibeFallback);
      }
      cache.set(cacheKey, altFallback);
      return res.json(altFallback);
    }
    cache.set(cacheKey, fallback);
    res.json(fallback);
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

app.get('/recent', async (req, res) => {
  const cacheKey = `recent`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const data = await fetchWithFallback(`/recent-episodes`);
    cache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    logError('Erro /recent: ' + err.message);
    res.status(500).json({ error: 'Erro ao buscar episódios recentes.', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`OtakuBantu API rodando na porta ${PORT}`);
});
