import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Calendar, MapPin, ArrowLeft, Trophy } from 'lucide-react';

export default function MatchDetail() {
    const { id } = useParams();
    const [match, setMatch] = useState(null);
    const [homeStats, setHomeStats] = useState([]);
    const [awayStats, setAwayStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatchData();
    }, [id]);

    async function fetchMatchData() {
        setLoading(true);
        // 1. Fetch Match Info
        const { data: matchData, error } = await supabase
            .from('matches')
            .select(`
                *,
                league:leagues(id, name, city, season),
                home_team:teams!home_team_id(id, name, logo_url),
                away_team:teams!away_team_id(id, name, logo_url)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error("Error fetching match", error);
            setLoading(false);
            return;
        }

        setMatch(matchData);

        // 2. Fetch Stats
        if (matchData.status === 'finished') {
            const { data: statsData } = await supabase
                .from('match_player_stats')
                .select(`
                    *,
                    player:players(id, first_name, last_name, photo_url, position)
                `)
                .eq('match_id', id);

            if (statsData) {
                // Filter by team_id to separate lists. 
                // Note: database stores team_id in match_player_stats

                // Sort by points descending for display? Or jersey number? Let's do Points for "Box Score" feel, or Name.
                // Usually Box Scores are sorted by minutes or points, or starters first. 
                // Let's sort by Points Descending.
                const sortedStats = statsData.sort((a, b) => b.points - a.points);

                setHomeStats(sortedStats.filter(s => s.team_id === matchData.home_team_id));
                setAwayStats(sortedStats.filter(s => s.team_id === matchData.away_team_id));
            }
        }
        setLoading(false);
    }

    if (loading) return <div className="p-12 text-center text-gray-500">Cargando resultados...</div>;
    if (!match) return <div className="p-12 text-center text-gray-500">Partido no encontrado.</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header / Nav */}
            <div className="mb-6">
                <Link to={`/leagues/${match.league?.id}`} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4">
                    <ArrowLeft size={18} /> Volver a {match.league?.name || 'la Liga'}
                </Link>
            </div>

            {/* Scoreboard Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                <div className="bg-slate-50 border-b border-slate-100 p-4 text-center text-sm text-gray-500 font-medium flex justify-center items-center gap-4">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(match.match_date).toLocaleDateString()}</span>
                    <span>|</span>
                    <span className="uppercase tracking-wider font-bold">{match.category}</span>
                    <span>|</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {match.league?.city}</span>
                </div>

                <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
                    {/* Home Team */}
                    <Link to={`/teams/${match.home_team_id}`} className="flex flex-col items-center gap-4 group flex-1">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform">
                            {match.home_team?.logo_url ? <img src={match.home_team.logo_url} className="w-full h-full object-cover" /> : <div className="text-gray-300 font-bold text-4xl">{match.home_team?.name?.charAt(0)}</div>}
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-center text-gray-800 group-hover:text-primary transition-colors leading-tight">
                            {match.home_team?.name}
                        </h2>
                    </Link>

                    {/* Score */}
                    <div className="flex flex-col items-center shrink-0">
                        {match.status === 'finished' ? (
                            <div className="text-6xl md:text-8xl font-black text-secondary tracking-tighter flex items-center gap-4">
                                <span>{match.home_score}</span>
                                <span className="text-gray-200 text-4xl md:text-6xl">:</span>
                                <span>{match.away_score}</span>
                            </div>
                        ) : (
                            <div className="text-4xl font-bold text-gray-300">VS</div>
                        )}
                        <span className="mt-2 text-sm font-bold text-gray-400 uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-full">
                            {match.status === 'finished' ? 'Finalizado' : 'Programado'}
                        </span>
                    </div>

                    {/* Away Team */}
                    <Link to={`/teams/${match.away_team_id}`} className="flex flex-col items-center gap-4 group flex-1">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform">
                            {match.away_team?.logo_url ? <img src={match.away_team.logo_url} className="w-full h-full object-cover" /> : <div className="text-gray-300 font-bold text-4xl">{match.away_team?.name?.charAt(0)}</div>}
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-center text-gray-800 group-hover:text-primary transition-colors leading-tight">
                            {match.away_team?.name}
                        </h2>
                    </Link>
                </div>
            </div>

            {/* Stats Tables */}
            {match.status === 'finished' && (
                <div className="grid grid-cols-1 gap-12">
                    <PublicStatsTable team={match.home_team} stats={homeStats} />
                    <PublicStatsTable team={match.away_team} stats={awayStats} />
                </div>
            )}

            {match.status !== 'finished' && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Las estadísticas estarán disponibles cuando finalice el partido.</p>
                </div>
            )}
        </div>
    );
}

function PublicStatsTable({ team, stats }) {
    if (!stats || stats.length === 0) return null;

    return (
        <div className="animate-fadeIn">
            <h3 className="text-xl font-bold text-secondary mb-4 border-l-4 border-primary pl-3 flex items-center gap-2">
                {team?.name} <span className="text-sm font-normal text-gray-400">Estadísticas</span>
            </h3>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                <th className="px-4 py-3 text-left">Jugador</th>
                                <th className="px-2 py-3 text-center" title="Minutos">MIN</th>
                                <th className="px-2 py-3 text-center bg-blue-50/50 text-blue-800" title="Puntos">PTS</th>
                                <th className="px-2 py-3 text-center" title="Rebotes">REB</th>
                                <th className="px-2 py-3 text-center" title="Asistencias">AST</th>
                                <th className="px-2 py-3 text-center" title="Robos">ROB</th>
                                <th className="px-2 py-3 text-center" title="Tapones">BLK</th>
                                <th className="px-2 py-3 text-center" title="Triples">3PM</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-2">
                                        <Link to={`/jugadores/${s.player.id}`} className="font-bold text-gray-900 hover:text-primary">
                                            {s.player.first_name} {s.player.last_name}
                                        </Link>
                                    </td>
                                    <td className="px-2 py-2 text-center text-gray-500 font-mono text-xs">{s.minutes_played || '-'}</td>
                                    <td className="px-2 py-2 text-center font-black text-secondary bg-blue-50/30">{s.points}</td>
                                    <td className="px-2 py-2 text-center text-gray-700">{s.rebounds}</td>
                                    <td className="px-2 py-2 text-center text-gray-700">{s.assists}</td>
                                    <td className="px-2 py-2 text-center text-gray-700">{s.steals}</td>
                                    <td className="px-2 py-2 text-center text-gray-700">{s.blocks}</td>
                                    <td className="px-2 py-2 text-center text-gray-500 text-xs">
                                        {s.three_points_made}/{s.three_points_attempted}
                                    </td>
                                </tr>
                            ))}
                            {/* Totals Row */}
                            <tr className="bg-slate-50 font-bold text-gray-900 border-t border-gray-200">
                                <td className="px-4 py-3 text-right uppercase text-xs tracking-wider">Totales</td>
                                <td className="px-2 py-3 text-center">-</td>
                                <td className="px-2 py-3 text-center text-secondary">{stats.reduce((sum, s) => sum + (s.points || 0), 0)}</td>
                                <td className="px-2 py-3 text-center">{stats.reduce((sum, s) => sum + (s.rebounds || 0), 0)}</td>
                                <td className="px-2 py-3 text-center">{stats.reduce((sum, s) => sum + (s.assists || 0), 0)}</td>
                                <td className="px-2 py-3 text-center">{stats.reduce((sum, s) => sum + (s.steals || 0), 0)}</td>
                                <td className="px-2 py-3 text-center">{stats.reduce((sum, s) => sum + (s.blocks || 0), 0)}</td>
                                <td className="px-2 py-3 text-center text-xs">
                                    {stats.reduce((sum, s) => sum + (s.three_points_made || 0), 0)}/{stats.reduce((sum, s) => sum + (s.three_points_attempted || 0), 0)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
