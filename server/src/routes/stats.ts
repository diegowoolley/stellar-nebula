import { Router } from 'express';
import type { Response } from 'express';
import { supabase } from '../db.js';
import { authenticateUser } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();

// Rota para buscar métricas e dados de gráficos do Dashboard
router.get('/', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
        // 1. Buscar todos os eventos com informações de artistas
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select(`
                id,
                status,
                date,
                city,
                state,
                artist_id,
                artists (name, logo_url)
            `);

        if (eventsError) throw eventsError;

        // 2. Buscar contagem de artistas ativos
        const { count: artistCount, error: artistsError } = await supabase
            .from('artists')
            .select('*', { count: 'exact', head: true });

        if (artistsError) throw artistsError;

        // 3. Calcular estatísticas gerais
        const totalShows = events.length;
        const confirmedShows = events.filter(e => e.status === 'confirmed').length;
        const pendingShows = events.filter(e => e.status === 'pending').length;
        const cancelledShows = events.filter(e => e.status === 'cancelled').length;

        // Cidades únicas
        const uniqueCities = new Set(events.map(e => e.city));
        const citiesServed = uniqueCities.size;

        const stats = {
            totalShows,
            confirmedShows,
            pendingShows,
            cancelledShows,
            activeArtists: artistCount || 0,
            citiesServed
        };

        // 4. Distribuição por status (para gráfico de pizza)
        const statusDistribution = [
            { status: 'Confirmados', count: confirmedShows, color: '#10b981' },
            { status: 'Pendentes', count: pendingShows, color: '#f59e0b' },
            { status: 'Cancelados', count: cancelledShows, color: '#ef4444' }
        ].filter(item => item.count > 0);

        // 5. Shows por mês (últimos 6 meses + próximos 6 meses)
        const monthlyData: { [key: string]: number } = {};
        const now = new Date();

        events.forEach(event => {
            const eventDate = new Date(event.date);
            const monthKey = eventDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        });

        const monthlyShows = Object.entries(monthlyData)
            .map(([month, count]) => ({ month, shows: count }))
            .slice(0, 12); // Limitar a 12 meses

        // 6. Top 5 artistas (com mais shows)
        const artistShowCount: { [key: string]: { name: string; count: number } } = {};

        events.forEach(event => {
            if (event.artists && event.artist_id) {
                const artistName = event.artists.name;
                if (!artistShowCount[event.artist_id]) {
                    artistShowCount[event.artist_id] = { name: artistName, count: 0 };
                }
                artistShowCount[event.artist_id].count++;
            }
        });

        const topArtists = Object.values(artistShowCount)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(artist => ({ name: artist.name, shows: artist.count }));

        // 7. Top 5 cidades (com mais eventos)
        const cityEventCount: { [key: string]: number } = {};

        events.forEach(event => {
            const cityKey = `${event.city}, ${event.state || ''}`.trim();
            cityEventCount[cityKey] = (cityEventCount[cityKey] || 0) + 1;
        });

        const topCities = Object.entries(cityEventCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([city, count]) => ({ city, events: count }));

        // 8. Próximos 5 shows (eventos futuros)
        const upcomingShows = events
            .filter(e => new Date(e.date) >= now && e.status !== 'cancelled')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map(event => ({
                id: event.id,
                artist: event.artists?.name || 'Sem artista',
                city: event.city,
                state: event.state,
                date: event.date,
                status: event.status
            }));

        // Retornar todos os dados agregados
        res.json({
            stats,
            statusDistribution,
            monthlyShows,
            topArtists,
            topCities,
            upcomingShows
        });

    } catch (error: any) {
        console.error('Erro na rota de stats:', error);
        res.status(500).json({ message: error.message || 'Erro ao buscar estatísticas' });
    }
});

export default router;
