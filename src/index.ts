import express, { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import {PORT, PRIVATE_KEY, APP_ID, INSTALLATION_ID} from './config'
import cors from 'cors';
const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://tuwebghprofiles.com'
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
