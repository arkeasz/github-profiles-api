import express, { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import {PORT, PRIVATE_KEY, APP_ID, INSTALLATION_ID, LINK_DOMAIN, LOCALHOST} from './config'
import cors from 'cors';
const app = express();

const allowedOrigins = [
  LOCALHOST,
  LINK_DOMAIN
];

app.use(cors({
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          callback(new Error('No permitido por CORS'));
      }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

async function authenticateApp(): Promise<string> {
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (10 * 60),
    iss: APP_ID,
  };

  const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });

  const response = await axios.post(
    `https://api.github.com/app/installations/${INSTALLATION_ID}/access_tokens`,
    null,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );

  return response.data.token;
}
app.get('/search-users', async (req: Request, res: Response) => {
  try {
    const token = await authenticateApp();
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    const perPage = parseInt(req.query.per_page as string, 10) || 20;

    const response = await axios.get(`https://api.github.com/search/users?q=${query}&page=${page}&per_page=${perPage}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.get('/get-repo/:username/:repo', async (req: Request, res: Response) => {
  try {
    const token = await authenticateApp();
    const username = req.params.username;
    const repo = req.params.repo;

    const response = await axios.get(`https://api.github.com/repos/${username}/${repo}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching repository:', error);
    res.status(500).json({ error: 'Error al obtener el repositorio del usuario' });
  }
});

app.get('/get-repo/:username/:repo/languages', async (req: Request, res: Response) => {
  try {
    const token = await authenticateApp();
    const username = req.params.username;
    const repo = req.params.repo;

    const response = await axios.get(`https://api.github.com/repos/${username}/${repo}/languages`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching repository:', error);
    res.status(500).json({ error: 'Error al obtener el repositorio del usuario' });
  }
});


app.get('/get-repos/:username', async (req: Request, res: Response) => {
  try {
    const token = await authenticateApp();
    const username = req.params.username;
    const page = parseInt(req.query.page as string, 10) || 1;
    const perPage = parseInt(req.query.per_page as string, 10) || 20;

    const response = await axios.get(`https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Error al obtener repositorios del usuario' });
  }
});


app.get('/get-profile/:username', async (req: Request, res: Response) => {
  try {
    const token = await authenticateApp();
    const username = req.params.username;
    const response = await axios.get(`https://api.github.com/users/${username}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Error al obtener el perfil de usuario' });
  }
});

app.listen(PORT);

console.log(`Server will run on port: ${PORT}`);
console.log(`App ID: ${APP_ID}`);
console.log(`Installation ID: ${INSTALLATION_ID}`);
console.log(`Allowed Localhost: ${LOCALHOST}`);
console.log(`Link Domain: ${LINK_DOMAIN}`);
