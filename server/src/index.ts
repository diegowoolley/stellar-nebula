import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { supabase } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares básicos de segurança e utilitários
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Verificação básica de saúde da API
app.get('/', (req, res) => {
    res.send('API do Sistema Dw Sistemas está rodando');
});

import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import artistRoutes from './routes/artists.js';
import contractorRoutes from './routes/contractors.js';
import userRoutes from './routes/users.js';
import publicRoutes from './routes/public.js';
import statsRoutes from './routes/stats.js';

// Registro das rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/stats', statsRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
