import dotenv from 'dotenv'
import fs from 'fs';

dotenv.config()

export const PORT = process.env.PORT || 3000;
export const PRIVATE_KEY = process.env.PRIVATE_KEY || fs.readFileSync('./private.pem', 'utf8')
export const APP_ID = process.env.APP_ID;
export const INSTALLATION_ID = process.env.INSTALLATION_ID;
export const LOCALHOST = process.env.LOCALHOST;
export const LINK_DOMAIN = process.env.LINK_DOMAIN;
