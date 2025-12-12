import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ArrowLeft, Ruler, User, Calendar } from 'lucide-react';

export default function PlayerDetail() {
    const { id } = useParams();
    const [player, setPlayer] = useState(null);
    const [stats, setStats] = useState({ games: 0, ppg: 0, rpg: 0, apg: 0, total_points: 0 });
    const [gameLog, setGameLog] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPlayerAndStats() {
            setLoading(true);
            try {
                // 1. Fetch Profile
                const { data: playerData, error } = await supabase
                    .from('players')
                    .select(`
                      *,
                      player_team_seasons (
                        season,
                        jersey_number,
                        teams ( id, name, category, league_id )
                      )
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;

                // Process Latest Season/Team
                const seasons = playerData.player_team_seasons || [];
                seasons.sort((a, b) => b.season.localeCompare(a.season));
                const currentSeason = seasons[0];
                const processedPlayer = {
                    ...playerData,
                    teams: currentSeason?.teams,
                    number_player: currentSeason?.jersey_number
                };
                setPlayer(processedPlayer);

                // 2. Fetch Stats
                const { data: statsData, error: statsError } = await supabase
                    .from('match_player_stats')
                    .select(`
                        *,
                        matches ( match_date, home_team_id, away_team_id, home_score, away_score, status,
                            home_team:teams!home_team_id(name),
                            away_team:teams!away_team_id(name)
                        )
                    `)
                    .eq('player_id', id)
                    .order('matches(match_date)', { ascending: false }); // Sort by date

                if (!statsError && statsData) {
                    setGameLog(statsData);

                    // Calculate Averages
                    const totalGames = statsData.length;
                    if (totalGames > 0) {
                        const totalPoints = statsData.reduce((sum, s) => sum + (s.points || 0), 0);
                        const totalRebounds = statsData.reduce((sum, s) => sum + (s.rebounds || 0), 0);
                        const totalAssists = statsData.reduce((sum, s) => sum + (s.assists || 0), 0);

                        setStats({
                            games: totalGames,
                            ppg: (totalPoints / totalGames).toFixed(1),
                            rpg: (totalRebounds / totalGames).toFixed(1),
                            apg: (totalAssists / totalGames).toFixed(1),
                            total_points: totalPoints
                        });
                    }
                }

            } catch (err) {
                console.error("Error loading player data", err);
            } finally {
                setLoading(false);
            }
        }

        fetchPlayerAndStats();
    }, [id]);

    if (loading) return <div className="p-10 text-center">Cargando perfil...</div>;
    if (!player) return <div className="p-10 text-center">Jugador no encontrado</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <Link to="/jugadores" className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} /> Volver al listado
            </Link>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row mb-8">
                <div className="md:w-1/3 bg-slate-100 relative min-h-[300px]">
                    {player.photo_url ? (
                        <img
                            src={player.photo_url}
                            alt={`${player.first_name} ${player.last_name}`}
                            className="w-full h-full object-cover absolute inset-0"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <User size={64} />
                        </div>
                    )}
                </div>

                <div className="p-8 md:w-2/3">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-secondary mb-1">
                                {player.first_name} <span className="text-primary">{player.last_name}</span>
                            </h1>
                            <p className="text-lg text-gray-600 font-medium">
                                {player.teams?.name} • {player.teams?.category}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="bg-secondary text-white px-3 py-1 rounded text-sm font-bold">
                                {player.position || 'Jugador'}
                            </span>
                            {player.number_player && (
                                <span className="text-4xl font-black text-slate-200">#{player.number_player}</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                        <StatBox label="Partidos" value={stats.games} />
                        <StatBox label="Puntos/P" value={stats.ppg} highlight />
                        <StatBox label="Rebotes/P" value={stats.rpg} />
                        <StatBox label="Asistencias/P" value={stats.apg} />
                    </div>
                </div>
            </div>

            {/* Game Log Section */}
            {stats.games > 0 && (
                <div className="animate-fadeIn">
                    <h3 className="text-xl font-bold text-secondary mb-4">Historial de Partidos</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-xs text-gray-500 uppercase font-bold border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Fecha</th>
                                        <th className="px-4 py-3 text-left">Partido</th>
                                        <th className="px-2 py-3 text-center">MIN</th>
                                        <th className="px-2 py-3 text-center">PTS</th>
                                        <th className="px-2 py-3 text-center">REB</th>
                                        <th className="px-2 py-3 text-center">AST</th>
                                        <th className="px-2 py-3 text-center">ROB</th>
                                        <th className="px-2 py-3 text-center">TAP</th>
                                        <th className="px-2 py-3 text-center hidden sm:table-cell">3PM</th>
                                        <th className="px-4 py-3 text-center">Detalle</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {gameLog.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-gray-600">
                                                {log.matches?.match_date ? new Date(log.matches.match_date).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                <span className={log.matches?.home_team_id === log.team_id ? 'font-bold' : ''}>
                                                    {log.matches?.home_team?.name}
                                                </span>
                                                <span className="mx-2 text-gray-400">vs</span>
                                                <span className={log.matches?.away_team_id === log.team_id ? 'font-bold' : ''}>
                                                    {log.matches?.away_team?.name}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3 text-center text-gray-500">{log.minutes_played}</td>
                                            <td className="px-2 py-3 text-center font-bold text-secondary bg-blue-50/30">{log.points}</td>
                                            <td className="px-2 py-3 text-center">{log.rebounds}</td>
                                            <td className="px-2 py-3 text-center">{log.assists}</td>
                                            <td className="px-2 py-3 text-center">{log.steals}</td>
                                            <td className="px-2 py-3 text-center">{log.blocks}</td>
                                            <td className="px-2 py-3 text-center hidden sm:table-cell text-xs text-gray-500">
                                                {log.three_points_made}/{log.three_points_attempted}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Link to={`/matches/${log.match_id}`} className="text-primary hover:underline text-xs font-bold">Ver</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatBox({ label, value, highlight = false }) {
    return (
        <div className={`p-3 rounded-lg border ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-surface border-slate-100'}`}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-black ${highlight ? 'text-primary' : 'text-gray-700'}`}>{value}</p>
        </div>
    );
}
