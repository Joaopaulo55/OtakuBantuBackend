const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const BASE_URL = 'https://animefire.plus';

app.get('/', (req, res) => {
  res.send('🔥 API OtakuBantu AnimeFire Ativa');
});

// 🟢 Lista de animes populares da página inicial
app.get('/animefire/populares', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/animes-atualizados`, {
      headers: {
        'User-Agent': 'Mozilla/5.0', // Evita bloqueio
      }
    });

    const $ = cheerio.load(data);
    const animes = [];

    $('.anime-card-container').each((i, el) => {
      const title = $(el).find('.anime-card-title').text().trim();
      const url = BASE_URL + $(el).find('a').attr('href');
      const thumb = $(el).find('img').attr('src');

      if (title && url && thumb) {
        animes.push({ title, url, thumb });
      }
    });

    res.json({ resultados: animes });
  } catch (err) {
    console.error("Erro scraping:", err.message);
    res.status(500).json({ erro: 'Erro ao obter populares do AnimeFire.plus' });
  }
});

// 🔍 Busca por nome
app.get('/animefire/buscar/:termo', async (req, res) => {
  try {
    const termo = req.params.termo.replace(/\s+/g, '+');
    const { data } = await axios.get(`${BASE_URL}/pesquisar/${termo}`);
    const $ = cheerio.load(data);
    const resultados = [];

    $('.col-lg-2 .anime__item').each((i, el) => {
      const title = $(el).find('.anime__item__text a').text().trim();
      const url = BASE_URL + $(el).find('a').attr('href');
      const thumb = $(el).find('img').attr('src');
      resultados.push({ title, url, thumb });
    });

    res.json({ resultados });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar anime' });
  }
});

// ▶️ Assistir episódio (pega iframe + lista de episódios)
app.get('/animefire/assistir/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { data } = await axios.get(`${BASE_URL}/animes/${slug}`);
    const $ = cheerio.load(data);

    const iframe = $('iframe').attr('src');
    const episodios = [];

    $('.episodes__item').each((i, el) => {
      const epTitle = $(el).text().trim();
      const epUrl = BASE_URL + $(el).attr('href');
      episodios.push({ epTitle, epUrl });
    });

    res.json({ player: iframe, episodios });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao obter episódio' });
  }
});

// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ OtakuBantu backend ativo na porta ${PORT}`);
});