import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';

export class StatsController {
    static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
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

            if (eventsError) throw new AppError(eventsError.message, 500);

            // 2. Buscar contagem de artistas ativos
            const { count: artistCount, error: artistsError } = await supabase
                .from('artists')
                .select('*', { count: 'exact', head: true });

            if (artistsError) throw new AppError(artistsError.message, 500);

            // 3. Calcular estatísticas gerais
            const totalShows = events?.length || 0;
            const confirmedShows = events?.filter(e => e.status === 'confirmed').length || 0;
            const pendingShows = events?.filter(e => e.status === 'pending').length || 0;
            const cancelledShows = events?.filter(e => e.status === 'cancelled').length || 0;

            const uniqueCities = new Set(events?.map(e => e.city) || []);
            const citiesServed = uniqueCities.size;

            const stats = {
                totalShows,
                confirmedShows,
                pendingShows,
                cancelledShows,
                activeArtists: artistCount || 0,
                citiesServed
            };

            // 4. Distribuição por status
            const statusDistribution = [
                { status: 'Confirmados', count: confirmedShows, color: '#10b981' },
                { status: 'Pendentes', count: pendingShows, color: '#f59e0b' },
                { status: 'Cancelados', count: cancelledShows, color: '#ef4444' }
            ].filter(item => item.count > 0);

            // 5. Shows por mês
            const monthlyData: { [key: string]: number } = {};
            events?.forEach(event => {
                const eventDate = new Date(event.date);
                const monthKey = eventDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
                monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
            });

            const monthlyShows = Object.entries(monthlyData)
                .map(([month, count]) => ({ month, shows: count }))
                .slice(0, 12);

            // 6. Top 5 artistas
            const artistShowCount: { [key: string]: { name: string; count: number } } = {};
            events?.forEach(event => {
                if (event.artists && event.artist_id) {
                    const artistName = (event.artists as any)?.name || 'Sem artista';
                    const artistId = event.artist_id;
                    if (!artistShowCount[artistId]) {
                        artistShowCount[artistId] = { name: artistName, count: 0 };
                    }
                    artistShowCount[artistId]!.count++;
                }
            });

            const topArtists = Object.values(artistShowCount)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(artist => ({ name: artist.name, shows: artist.count }));

            // 7. Top 5 cidades
            const cityEventCount: { [key: string]: number } = {};
            events?.forEach(event => {
                const cityKey = `${event.city}, ${event.state || ''}`.trim();
                cityEventCount[cityKey] = (cityEventCount[cityKey] || 0) + 1;
            });

            const topCities = Object.entries(cityEventCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([city, count]) => ({ city, events: count }));

            // 8. Próximos 5 shows
            const now = new Date();
            const upcomingShows = (events || [])
                .filter(e => new Date(e.date) >= now && e.status !== 'cancelled')
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(event => ({
                    id: event.id,
                    artist: (event.artists as any)?.name || 'Sem artista',
                    city: event.city,
                    state: event.state,
                    date: event.date,
                    status: event.status
                }));

            res.json({
                stats,
                statusDistribution,
                monthlyShows,
                topArtists,
                topCities,
                upcomingShows
            });
        } catch (error) {
            next(error);
        }
    }

    static async getMonthlyStats(req: Request, res: Response, next: NextFunction) {
        try {
            // Placeholder: Em um cenário real, você faria uma query agregada por mês
            const { data, error } = await supabase.from('events').select('date, status');
            if (error) throw new AppError(error.message, 500);

            // Simulação de agrupamento simples para o gráfico do dashboard
            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
            const stats = months.map((month, index) => ({
                month,
                events: data.filter(e => new Date(e.date).getMonth() === index).length
            }));

            res.json(stats);
        } catch (error) {
            next(error);
        }
    }
}
