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
                // First try with season context
                let query = supabase
                    .from('player_team_seasons')
                    .select(`
                        id,
                        season,
                        jersey_number,
                        player:players(id, first_name, last_name, photo_url, position)
                    `)
                    .eq('team_id', teamId);

                if (season) {
                    query = query.eq('season', season);
                }

                let { data, error } = await query;

                // Fallback: If no players found with season, try fetching ANY player ever assigned to this team
                // This handles cases where League Season string might verify slightly from Player Assignment
                if (!error && (!data || data.length === 0)) {
                    console.log("No players found for season strictly. Fetching all time roster for team.");
                    const { data: allData, error: allError } = await supabase
                        .from('player_team_seasons')
                        .select(`
                            id,
                            season,
                            jersey_number,
                            player:players(id, first_name, last_name, photo_url, position)
                         `)
                        .eq('team_id', teamId)
                        .order('season', { ascending: false }); // Get latest

                    if (!allError && allData) {
                        // Filter distinct players (take latest season assignment)
                        const seen = new Set();
                        data = [];
                        for (const item of allData) {
                            if (!seen.has(item.player.id)) {
                                seen.add(item.player.id);
                                data.push(item);
                            }
                        }
                    }
                }

                if (error) {
                    console.error("Error fetching roster", error);
                    return [];
                }

                return (data || []).map(item => ({
                    ...item.player,
                    jersey_number: item.jersey_number,
                    position: item.player.position // Ensure position is carried over
                })).sort((a, b) => (parseInt(a.jersey_number) || 999) - (parseInt(b.jersey_number) || 999));
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

        const buildPayload = (p, teamId) => {
            const s = stats[p.id] || {};
            // Calculate Points if not manually overridden (though UI is readonly for points, good to calculate here too)
            const pts = (parseInt(s.two_points_made || 0) * 2) +
                (parseInt(s.three_points_made || 0) * 3) +
                (parseInt(s.free_throws_made || 0) * 1);

            return {
                match_id: id,
                player_id: p.id,
                team_id: teamId,
                minutes_played: s.minutes_played || 0,
                // Detailed Stats
                two_points_made: s.two_points_made || 0,
                two_points_attempted: s.two_points_attempted || 0,
                three_points_made: s.three_points_made || 0,
                three_points_attempted: s.three_points_attempted || 0,
                free_throws_made: s.free_throws_made || 0,
                free_throws_attempted: s.free_throws_attempted || 0,

                rebounds: s.rebounds || 0,
                assists: s.assists || 0,
                steals: s.steals || 0,
                blocks: s.blocks || 0,
                turnovers: s.turnovers || 0,
                fouls: s.fouls || 0,

                points: pts,
                stats_recorded: true
            };
        };

        // Home players
        homePlayers.forEach(p => payloads.push(buildPayload(p, match.home_team_id)));
        // Away players
        awayPlayers.forEach(p => payloads.push(buildPayload(p, match.away_team_id)));

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
        <div className="bg-white p-6 rounded-xl shadow border border-slate-100 mb-6">
            <h2 className="text-xl font-bold mb-4 text-secondary">{teamName}</h2>
            <p className="text-gray-500 italic">No hay jugadores registrados. Verifique la asignación de temporadas.</p>
        </div>
    );

    // Helper to extract value safely
    const val = (playerId, field) => stats[playerId]?.[field] || '';

    // Calculate Points automatically: (2PM * 2) + (3PM * 3) + (FTM * 1)
    const calculatePoints = (playerId) => {
        const p2 = parseInt(val(playerId, 'two_points_made') || 0) * 2;
        const p3 = parseInt(val(playerId, 'three_points_made') || 0) * 3;
        const p1 = parseInt(val(playerId, 'free_throws_made') || 0);
        return p2 + p3 + p1;
    };

    return (
        <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden mb-8">
            <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-secondary">{teamName}</h2>
                <span className="text-sm text-gray-500">{players.length} plantilla</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        {/* Group Headers */}
                        <tr className="bg-slate-100 text-gray-600 uppercase tracking-wider font-bold border-b border-gray-200">
                            <th colSpan="3" className="px-2 py-1 text-left border-r bg-slate-50">Jugador</th>
                            <th colSpan="2" className="px-2 py-1 text-center border-r bg-blue-50 text-blue-800">2 Puntos</th>
                            <th colSpan="2" className="px-2 py-1 text-center border-r bg-orange-50 text-orange-800">3 Puntos</th>
                            <th colSpan="2" className="px-2 py-1 text-center border-r bg-green-50 text-green-800">Tiros Libres</th>
                            <th colSpan="1" className="px-2 py-1 text-center border-r">Reb</th>
                            <th colSpan="5" className="px-2 py-1 text-center border-r">Juego</th>
                            <th colSpan="1" className="px-2 py-1 text-center bg-gray-100">Total</th>
                        </tr>
                        {/* Sub Headers */}
                        <tr className="bg-gray-50 text-gray-500 font-semibold border-b">
                            <th className="px-2 py-2 text-center w-8">#</th>
                            <th className="px-2 py-2 text-left min-w-[150px]">Nombre</th>
                            <th className="px-2 py-2 text-center w-12 border-r">Min</th>

                            {/* 2Pts */}
                            <th className="px-1 py-1 text-center w-10 bg-blue-50/50" title="Convertidos">C</th>
                            <th className="px-1 py-1 text-center w-10 border-r bg-blue-50/50" title="Intentados">I</th>

                            {/* 3Pts */}
                            <th className="px-1 py-1 text-center w-10 bg-orange-50/50" title="Convertidos">C</th>
                            <th className="px-1 py-1 text-center w-10 border-r bg-orange-50/50" title="Intentados">I</th>

                            {/* FT */}
                            <th className="px-1 py-1 text-center w-10 bg-green-50/50" title="Convertidos">C</th>
                            <th className="px-1 py-1 text-center w-10 border-r bg-green-50/50" title="Intentados">I</th>

                            {/* Stats */}
                            <th className="px-1 py-1 text-center w-10 border-r" title="Rebotes Totales">RT</th>
                            <th className="px-1 py-1 text-center w-10" title="Asistencias">AS</th>
                            <th className="px-1 py-1 text-center w-10" title="Recuperos / Robos">REC</th>
                            <th className="px-1 py-1 text-center w-10" title="Pérdidas">PER</th>
                            <th className="px-1 py-1 text-center w-10" title="Tapones / Bloqueos">TAP</th>
                            <th className="px-1 py-1 text-center w-10 border-r text-red-600" title="Faltas">FAL</th>

                            <th className="px-2 py-2 text-center w-12 bg-gray-100 font-bold border-l">PTS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {players.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-2 py-2 text-center font-mono text-gray-400">{p.jersey_number}</td>
                                <td className="px-2 py-2 font-medium text-gray-900 truncate max-w-[150px]" title={`${p.first_name} ${p.last_name}`}>
                                    {p.last_name}, {p.first_name.charAt(0)}.
                                </td>
                                <td className="px-1 py-1 border-r">
                                    <input tabIndex="1" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1 focus:ring-1 focus:ring-primary" placeholder="min" value={val(p.id, 'minutes_played')} onChange={(e) => updateStat(p.id, 'minutes_played', e.target.value)} />
                                </td>

                                {/* 2 Pts */}
                                <td className="px-1 py-1 bg-blue-50/30">
                                    <input tabIndex="2" type="number" className="w-full text-center border-blue-200 rounded text-xs p-1 focus:ring-1 focus:ring-blue-500 font-bold" value={val(p.id, 'two_points_made')} onChange={(e) => updateStat(p.id, 'two_points_made', e.target.value)} />
                                </td>
                                <td className="px-1 py-1 border-r bg-blue-50/30">
                                    <input tabIndex="2" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1 focus:ring-1 focus:ring-blue-500 text-gray-400" placeholder="/" value={val(p.id, 'two_points_attempted')} onChange={(e) => updateStat(p.id, 'two_points_attempted', e.target.value)} />
                                </td>

                                {/* 3 Pts */}
                                <td className="px-1 py-1 bg-orange-50/30">
                                    <input tabIndex="3" type="number" className="w-full text-center border-orange-200 rounded text-xs p-1 focus:ring-1 focus:ring-orange-500 font-bold" value={val(p.id, 'three_points_made')} onChange={(e) => updateStat(p.id, 'three_points_made', e.target.value)} />
                                </td>
                                <td className="px-1 py-1 border-r bg-orange-50/30">
                                    <input tabIndex="3" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1 focus:ring-1 focus:ring-orange-500 text-gray-400" placeholder="/" value={val(p.id, 'three_points_attempted')} onChange={(e) => updateStat(p.id, 'three_points_attempted', e.target.value)} />
                                </td>

                                {/* Free Throws */}
                                <td className="px-1 py-1 bg-green-50/30">
                                    <input tabIndex="4" type="number" className="w-full text-center border-green-200 rounded text-xs p-1 focus:ring-1 focus:ring-green-500 font-bold" value={val(p.id, 'free_throws_made')} onChange={(e) => updateStat(p.id, 'free_throws_made', e.target.value)} />
                                </td>
                                <td className="px-1 py-1 border-r bg-green-50/30">
                                    <input tabIndex="4" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1 focus:ring-1 focus:ring-green-500 text-gray-400" placeholder="/" value={val(p.id, 'free_throws_attempted')} onChange={(e) => updateStat(p.id, 'free_throws_attempted', e.target.value)} />
                                </td>

                                {/* Rebounds */}
                                <td className="px-1 py-1 border-r">
                                    <input tabIndex="5" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1 focus:ring-1 focus:ring-primary" value={val(p.id, 'rebounds')} onChange={(e) => updateStat(p.id, 'rebounds', e.target.value)} />
                                </td>

                                {/* Other Stats */}
                                <td className="px-1 py-1">
                                    <input tabIndex="6" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1 focus:ring-1 focus:ring-primary" value={val(p.id, 'assists')} onChange={(e) => updateStat(p.id, 'assists', e.target.value)} />
                                </td>
                                <td className="px-1 py-1">
                                    <input tabIndex="7" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1 focus:ring-1 focus:ring-primary" value={val(p.id, 'steals')} onChange={(e) => updateStat(p.id, 'steals', e.target.value)} />
                                </td>
                                <td className="px-1 py-1">
                                    <input tabIndex="8" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1 focus:ring-1 focus:ring-primary" value={val(p.id, 'turnovers')} onChange={(e) => updateStat(p.id, 'turnovers', e.target.value)} />
                                </td>
                                <td className="px-1 py-1">
                                    <input tabIndex="9" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1 focus:ring-1 focus:ring-primary" value={val(p.id, 'blocks')} onChange={(e) => updateStat(p.id, 'blocks', e.target.value)} />
                                </td>
                                <td className="px-1 py-1 border-r">
                                    <input tabIndex="10" type="number" className="w-full text-center border-red-100 rounded text-xs p-1 text-red-600 focus:ring-1 focus:ring-red-500" value={val(p.id, 'fouls')} onChange={(e) => updateStat(p.id, 'fouls', e.target.value)} />
                                </td>

                                {/* Calculated Points */}
                                <td className="px-2 py-2 bg-gray-100/50 text-center font-black text-gray-800 border-l">
                                    {calculatePoints(p.id)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-slate-50 px-6 py-2 text-xs text-gray-400 text-center">
                C: Convertidos | I: Intentados | RT: Rebotes Totales
            </div>
        </div>
    );
}
