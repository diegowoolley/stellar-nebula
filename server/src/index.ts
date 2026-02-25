/**
 * Ponto de Entrada Principal (Servidor Node.js com Express).
 * 
 * Configura o servidor, middlewares de segurança/CORS e registra todas as rotas da API.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middlewares Básicos de Segurança e Utilitários:
 * - Helmet: Proteção de cabeçalhos HTTP
 * - CORS: Permissão de origens seguras (Front-end e Localhost)
 * - express.json(): Parser do corpo das requisições em JSON
 */
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Permitir requests sem origin (como Postman ou aplicativos móveis em desenvolvimento)
        if (!origin) return callback(null, true);

        // Permitir qualquer localhost em ambiente de desenvolvimento (React/Vite)
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }

        // Permitir a origem específica configurada (.env de produção)
        if (allowedOrigin === origin) {
            return callback(null, true);
        }

        callback(new Error('Bloqueado pelas políticas de CORS'));
    },
    credentials: true
}));
app.use(express.json());

/**
 * Rota raiz de verificação básica de integridade da API do Dw Sistemas.
 */
app.get('/', (req, res) => {
    res.send('API do Sistema Dw Sistemas está rodando normalmente');
});

// Importação das rotas
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import artistRoutes from './routes/artists.js';
import contractorRoutes from './routes/contractors.js';
import userRoutes from './routes/users.js';
import publicRoutes from './routes/public.js';
import statsRoutes from './routes/stats.js';
import financeRoutes from './routes/finance.js';

/**
 * Registro unificado das Rotas da API
 * Cada módulo de rota cuidará do seu próprio escopo.
 */
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/finance', financeRoutes);

/**
 * Middleware de Tratamento Centralizado de Erros.
 * Captura e processa todas as exceções lançadas nos Controllers.
 */
app.use(errorHandler);

/**
 * Inicialização do Servidor HTTP.
 */
app.listen(PORT, () => {
    console.log(`Servidor Dw Sistemas inicializado e ouvindo na porta ${PORT}`);
});
