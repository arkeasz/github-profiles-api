import express, { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import {PORT, PRIVATE_KEY, APP_ID, INSTALLATION_ID} from './config'
const app = express();

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
