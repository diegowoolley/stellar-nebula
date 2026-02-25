import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares básicos de segurança e utilitários
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Permitir requests sem origin (como Postman ou mobile apps)
        if (!origin) return callback(null, true);

        // Permitir qualquer localhost em desenvolvimento
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }

        // Permitir origin específica configurada
        if (allowedOrigin === origin) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
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

// Centralized error handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
