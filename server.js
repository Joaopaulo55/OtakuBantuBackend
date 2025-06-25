import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json()); // For parsing application/json
const PORT = process.env.PORT || 5000;

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Rota para buscar animes por nome (usando GogoAnime API não oficial)
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    try {
        const response = await axios.get(`https://gogoanime-api-production.up.railway.app/search?keyw=${encodeURIComponent(query)}`);
        res.json(response.data);
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Erro ao buscar animes' });
    }
});

// Rota para obter detalhes de um anime
app.get('/api/anime/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const response = await axios.get(`https://gogoanime-api-production.up.railway.app/anime-details/${id}`);
        res.json(response.data);
    } catch (err) {
        console.error('Anime details error:', err);
        res.status(500).json({ error: 'Erro ao buscar detalhes do anime' });
    }
});

// Rota para pegar link de vídeo do episódio
app.get('/api/watch/:ep', async (req, res) => {
    const epId = req.params.ep;
    try {
        const response = await axios.get(`https://gogoanime-api-production.up.railway.app/vidcdn/watch/${epId}`);
        res.json(response.data);
    } catch (err) {
        console.error('Watch episode error:', err);
        res.status(500).json({ error: 'Erro ao buscar vídeo' });
    }
});

// User authentication routes (stubs - you'll need to implement these properly)
app.post('/api/auth/login', (req, res) => {
    // In a real app, you would validate credentials against a database
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    res.json({ token: 'dummy-token', user: { email, name: 'Test User' } });
});

app.post('/api/auth/register', (req, res) => {
    const userData = req.body;
    if (!userData.email || !userData.password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    res.json({ message: 'User registered successfully', user: userData });
});

// Newsletter subscription
app.post('/api/newsletter/subscribe', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    res.json({ message: 'Subscription successful', email });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));