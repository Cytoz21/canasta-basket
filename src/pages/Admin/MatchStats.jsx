import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { ArrowLeft, Save, Activity, CheckCircle } from 'lucide-react';

export default function MatchStats() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState(null);
    const [homePlayers, setHomePlayers] = useState([]);
    const [awayPlayers, setAwayPlayers] = useState([]);
    const [stats, setStats] = useState({}); // Map: playerId -> statObject

    useEffect(() => {
        fetchData();
    }, [id]);

    async function fetchData() {
        try {
            setLoading(true);

            // 1. Fetch Match Info
            const { data: matchData, error: matchError } = await supabase
                .from('matches')
                .select(`
                    *,
                    league:leagues(*),
                    home_team:teams!home_team_id(id, name),
                    away_team:teams!away_team_id(id, name)
                `)
                .eq('id', id)
                .single();

            if (matchError) throw matchError;
            setMatch(matchData);

            // 2. Fetch Players for both teams based on League/Season context
            // We need to join with player_team_seasons
            const season = matchData.league?.season;

            // Helper to fetch roster
            const fetchRoster = async (teamId) => {
                const { data, error } = await supabase
                    .from('player_team_seasons')
                    .select(`
                        player:players(id, first_name, last_name, photo_url, position),
                        jersey_number
                    `)
                    .eq('team_id', teamId)
                    .eq('league_id', matchData.league_id)
                    .eq('season', season);

                if (error) {
                    console.error("Error fetching roster", error);
                    return [];
                }
                return data.map(item => ({
                    ...item.player,
                    jersey_number: item.jersey_number
                }));
            };

            const [hPlayers, aPlayers] = await Promise.all([
                fetchRoster(matchData.home_team_id),
                fetchRoster(matchData.away_team_id)
            ]);

            setHomePlayers(hPlayers);
            setAwayPlayers(aPlayers);

            // 3. Fetch Existing Stats
            const { data: existingStats, error: statsError } = await supabase
                .from('match_player_stats')
                .select('*')
                .eq('match_id', id);

            if (statsError) throw statsError;

            // Initialize stats map
            const statsMap = {};
            existingStats.forEach(s => {
                statsMap[s.player_id] = s;
            });

            setStats(statsMap);

        } catch (error) {
            console.error("Error loading match data:", error);
            alert("Error cargando informacion del partido");
        } finally {
            setLoading(false);
        }
    }

    const updateStat = (playerId, field, value) => {
        setStats(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                [field]: value
            }
        }));
    };

    const saveStats = async (playerId, teamId) => {
        const playerStats = stats[playerId] || {};

        const payload = {
            match_id: id,
            player_id: playerId,
            team_id: teamId,
            minutes_played: playerStats.minutes_played || 0,
            points: playerStats.points || 0,
            rebounds: playerStats.rebounds || 0,
            assists: playerStats.assists || 0,
            steals: playerStats.steals || 0,
            blocks: playerStats.blocks || 0,
            turnovers: playerStats.turnovers || 0,
            fouls: playerStats.fouls || 0,
            stats_recorded: true
        };

        const { error } = await supabase
            .from('match_player_stats')
            .upsert(payload, { onConflict: 'match_id, player_id' });

        if (error) {
            alert('Error al guardar: ' + error.message);
        } else {
            // Visual feedback could go here
            // alert('Guardado');
        }
    };

    const handleSaveAll = async () => {
        setLoading(true);
        // Build all payloads
        const payloads = [];

        // Home players
        homePlayers.forEach(p => {
            const s = stats[p.id] || {};
            // Only save if there is some data or explicitly entering 0s
            // implementing "Upsert all" is safer
            payloads.push({
                match_id: id,
                player_id: p.id,
                team_id: match.home_team_id,
                minutes_played: s.minutes_played || 0,
                points: s.points || 0,
                rebounds: s.rebounds || 0,
                assists: s.assists || 0,
                steals: s.steals || 0,
                blocks: s.blocks || 0,
                turnovers: s.turnovers || 0,
                fouls: s.fouls || 0,
                stats_recorded: true
            });
        });

        // Away players
        awayPlayers.forEach(p => {
            const s = stats[p.id] || {};
            payloads.push({
                match_id: id,
                player_id: p.id,
                team_id: match.away_team_id,
                minutes_played: s.minutes_played || 0,
                points: s.points || 0,
                rebounds: s.rebounds || 0,
                assists: s.assists || 0,
                steals: s.steals || 0,
                blocks: s.blocks || 0,
                turnovers: s.turnovers || 0,
                fouls: s.fouls || 0,
                stats_recorded: true
            });
        });

        const { error } = await supabase
            .from('match_player_stats')
            .upsert(payloads, { onConflict: 'match_id, player_id' });

        setLoading(false);
        if (error) alert('Error guardando todo: ' + error.message);
        else alert('Estadísticas guardadas exitosamente');
    };

    if (loading && !match) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/matches')} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-secondary flex items-center gap-2">
                            <Activity size={24} /> Estadísticas de Partido
                        </h1>
                        <p className="text-gray-600">
                            {match?.home_team?.name} vs {match?.away_team?.name}
                            <span className="mx-2">|</span>
                            {new Date(match?.match_date).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSaveAll}
                    disabled={loading}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                >
                    <Save size={20} /> Guardar Todo
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Home Team */}
                <TeamStatsTable
                    teamName={match?.home_team?.name}
                    players={homePlayers}
                    stats={stats}
                    updateStat={updateStat}
                    teamId={match?.home_team_id}
                />

                {/* Away Team */}
                <TeamStatsTable
                    teamName={match?.away_team?.name}
                    players={awayPlayers}
                    stats={stats}
                    updateStat={updateStat}
                    teamId={match?.away_team_id}
                />
            </div>
        </div>
    );
}

function TeamStatsTable({ teamName, players, stats, updateStat, teamId }) {
    if (players.length === 0) return (
        <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
            <h2 className="text-xl font-bold mb-4 text-secondary">{teamName}</h2>
            <p className="text-gray-500 italic">No hay jugadores registrados en esta temporada ({teamName})</p>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-secondary">{teamName}</h2>
                <span className="text-sm text-gray-500">{players.length} jugadores</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-4 py-2 text-left">#</th>
                            <th className="px-4 py-2 text-left">Jugador</th>
                            <th className="px-2 py-2 text-center w-16">Min</th>
                            <th className="px-2 py-2 text-center w-16 bg-blue-50/50">PTS</th>
                            <th className="px-2 py-2 text-center w-16">REB</th>
                            <th className="px-2 py-2 text-center w-16">AST</th>
                            <th className="px-2 py-2 text-center w-16">ROB</th>
                            <th className="px-2 py-2 text-center w-16">BLK</th>
                            <th className="px-2 py-2 text-center w-16">PER</th>
                            <th className="px-2 py-2 text-center w-16 text-red-600">FAL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {players.map(p => {
                            const s = stats[p.id] || {};
                            return (
                                <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-gray-400">{p.jersey_number || '-'}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {p.first_name} {p.last_name}
                                    </td>
                                    <td className="px-2 py-1"><input type="number" className="w-full text-center border rounded p-1" value={s.minutes_played || ''} onChange={(e) => updateStat(p.id, 'minutes_played', e.target.value)} /></td>
                                    <td className="px-2 py-1 bg-blue-50/30"><input type="number" className="w-full text-center border rounded p-1 font-bold text-blue-900" value={s.points || ''} onChange={(e) => updateStat(p.id, 'points', e.target.value)} /></td>
                                    <td className="px-2 py-1"><input type="number" className="w-full text-center border rounded p-1" value={s.rebounds || ''} onChange={(e) => updateStat(p.id, 'rebounds', e.target.value)} /></td>
                                    <td className="px-2 py-1"><input type="number" className="w-full text-center border rounded p-1" value={s.assists || ''} onChange={(e) => updateStat(p.id, 'assists', e.target.value)} /></td>
                                    <td className="px-2 py-1"><input type="number" className="w-full text-center border rounded p-1" value={s.steals || ''} onChange={(e) => updateStat(p.id, 'steals', e.target.value)} /></td>
                                    <td className="px-2 py-1"><input type="number" className="w-full text-center border rounded p-1" value={s.blocks || ''} onChange={(e) => updateStat(p.id, 'blocks', e.target.value)} /></td>
                                    <td className="px-2 py-1"><input type="number" className="w-full text-center border rounded p-1" value={s.turnovers || ''} onChange={(e) => updateStat(p.id, 'turnovers', e.target.value)} /></td>
                                    <td className="px-2 py-1"><input type="number" className="w-full text-center border rounded p-1 text-red-700" value={s.fouls || ''} onChange={(e) => updateStat(p.id, 'fouls', e.target.value)} /></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
