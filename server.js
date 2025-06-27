// server.js (usando sua API Consumet personalizada)
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const BASE_URL = "https://consumet-api-ur6f.onrender.com/anime/gogoanime";

// Rota: Populares
app.get("/popular", async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/top-airing`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar populares" });
  }
});

// Rota: Episódios Recentes
app.get("/recent", async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/recent-episodes`);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Erro ao buscar episódios recentes" });
  }
});

// Rota: Buscar anime
app.get("/search/:query", async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/${req.params.query}`);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Erro ao buscar anime" });
  }
});

// Rota: Detalhes do anime
app.get("/anime/:id", async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/info/${req.params.id}`);
    res.json(data);
  } catch {
    res.status(500).json({ error: "Erro ao obter detalhes do anime" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
