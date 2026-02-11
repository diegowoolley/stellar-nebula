import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { supabase } from './db.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
// Verificaçao básica de saúde
app.get('/', (req, res) => {
    res.send('API do Sistema de Eventos Artísticos está rodando');
});
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import artistRoutes from './routes/artists.js';
import contractorRoutes from './routes/contractors.js';
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/contractors', contractorRoutes);
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
//# sourceMappingURL=index.js.map