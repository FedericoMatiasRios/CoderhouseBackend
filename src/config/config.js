import dotenv from 'dotenv';

dotenv.config()

export const mongodbCnxStr = process.env.MONGODB_CNX_STR;
export const sessionSecret = process.env.SESSION_SECRET;
export const githubClientId = process.env.GITHUB_CLIENT_ID;
export const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
export const palabraSecreta = process.env.PALABRA_SECRETA;
export const emailUser = process.env.EMAIL_USER;
export const emailPass = process.env.EMAIL_PASS;
export const nodeEnv = process.env.NODE_ENV || 'development';
export const stripeSecret = process.env.STRIPE_SECRET;
