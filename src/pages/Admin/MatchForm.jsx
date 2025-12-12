import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Activity } from 'lucide-react';

export default function MatchForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const isEditing = !!id;

    const [leagues, setLeagues] = useState([]);
    const [categories, setCategories] = useState([]);
    const [teams, setTeams] = useState([]);

    // Stats State
    const [currentSeason, setCurrentSeason] = useState(null);
    const [homeRoster, setHomeRoster] = useState([]);
    const [awayRoster, setAwayRoster] = useState([]);
    const [stats, setStats] = useState({}); // { playerId: { ...stats } }

    const [formData, setFormData] = useState({
        league_id: '',
        home_team_id: '',
        away_team_id: '',
        match_date: '',
        home_score: 0,
        away_score: 0,
        status: 'scheduled', // 'scheduled', 'finished'
        is_walkover: false,
        category: ''
    });

    useEffect(() => {
        fetchLeagues();
        if (isEditing) {
            fetchMatchDetails();
        }
    }, [id]);

    // When league/teams change, we might need to refetch rosters if we have enough info
    useEffect(() => {
        if (formData.league_id && formData.home_team_id && currentSeason) {
            fetchRoster(formData.home_team_id, setHomeRoster);
        }
    }, [formData.league_id, formData.home_team_id, currentSeason]);

    useEffect(() => {
        if (formData.league_id && formData.away_team_id && currentSeason) {
            fetchRoster(formData.away_team_id, setAwayRoster);
        }
    }, [formData.league_id, formData.away_team_id, currentSeason]);


    async function fetchLeagues() {
        // Fetch seasons too
        const { data: leaguesData } = await supabase.from('leagues').select('id, name, season');
        setLeagues(leaguesData || []);

        const { data: catData } = await supabase.from('categories').select('name').order('name');
        if (catData) setCategories(catData);
    }

    async function fetchMatchDetails() {
        setLoading(true);
        const { data, error } = await supabase.from('matches').select('*').eq('id', id).single();
        if (error) {
            console.error(error);
            return;
        }

        setFormData(data);

        // Fetch teams for this league instantly so dropdowns work
        fetchTeams(data.league_id);

        // Set current season from league list (requires leagues to be loaded, but async might race. 
        // Safer to fetch specific league details or wait. Let's fetch specific league season if not in list yet)
        const { data: league } = await supabase.from('leagues').select('season').eq('id', data.league_id).single();
        if (league) setCurrentSeason(league.season);

        // Fetch existing stats
        const { data: statsData } = await supabase.from('match_player_stats').select('*').eq('match_id', id);
        const statsMap = {};
        (statsData || []).forEach(s => statsMap[s.player_id] = s);
        setStats(statsMap);

        setLoading(false);
    }

    async function fetchTeams(leagueId) {
        if (!leagueId) return;
        const { data } = await supabase.from('teams').select('id, name, category').eq('league_id', leagueId);
        setTeams(data || []);
    }

    const handleLeagueChange = (e) => {
        const leagueId = e.target.value;
        const selectedLeague = leagues.find(l => l.id === leagueId);

        setFormData({ ...formData, league_id: leagueId, home_team_id: '', away_team_id: '' });
        setCurrentSeason(selectedLeague?.season || null);
        fetchTeams(leagueId);
    };

    // Roster Fetching Logic (Same as MatchStats)
    const fetchRoster = async (teamId, setRosterFn) => {
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

        if (currentSeason) {
            query = query.eq('season', currentSeason);
        }

        let { data, error } = await query;

        // Fallback
        if (!error && (!data || data.length === 0)) {
            const { data: allData, error: allError } = await supabase
                .from('player_team_seasons')
                .select(`
                    id,
                    season,
                    jersey_number,
                    player:players(id, first_name, last_name, photo_url, position)
                 `)
                .eq('team_id', teamId)
                .order('season', { ascending: false });

            if (!allError && allData) {
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

        if (data) {
            const formatted = data.map(item => ({
                ...item.player,
                jersey_number: item.jersey_number,
                position: item.player.position
            })).sort((a, b) => (parseInt(a.jersey_number) || 999) - (parseInt(b.jersey_number) || 999));
            setRosterFn(formatted);
        }
    };

    const updateStat = (playerId, field, value) => {
        setStats(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                [field]: value
            }
        }));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const payload = { ...formData };

        // Winner Logic
        if (payload.status === 'finished') {
            if (parseInt(payload.home_score) > parseInt(payload.away_score)) {
                payload.winner_id = payload.home_team_id;
            } else if (parseInt(payload.away_score) > parseInt(payload.home_score)) {
                payload.winner_id = payload.away_team_id;
            } else {
                payload.winner_id = null;
            }
        }

        try {
            // 1. Save Match
            let matchId = id;
            if (isEditing) {
                const { error } = await supabase.from('matches').update(payload).eq('id', id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('matches').insert([payload]).select().single();
                if (error) throw error;
                matchId = data.id;
            }

            // 2. Save Stats if Finished
            if (payload.status === 'finished' && matchId) {
                const statsPayloads = [];
                const buildStatPayload = (p, teamId) => {
                    const s = stats[p.id] || {};
                    const pts = (parseInt(s.two_points_made || 0) * 2) +
                        (parseInt(s.three_points_made || 0) * 3) +
                        (parseInt(s.free_throws_made || 0) * 1);
                    return {
                        match_id: matchId,
                        player_id: p.id,
                        team_id: teamId,
                        minutes_played: s.minutes_played || 0,
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

                [...homeRoster].forEach(p => statsPayloads.push(buildStatPayload(p, formData.home_team_id)));
                [...awayRoster].forEach(p => statsPayloads.push(buildStatPayload(p, formData.away_team_id)));

                if (statsPayloads.length > 0) {
                    const { error: statsError } = await supabase
                        .from('match_player_stats')
                        .upsert(statsPayloads, { onConflict: 'match_id, player_id' });
                    if (statsError) throw statsError;
                }
            }

            alert('Partido y estadísticas guardados correctamente.');
            navigate('/admin/matches');

        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/admin/matches')} className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-secondary">{isEditing ? 'Editar Partido' : 'Registrar Nuevo Partido'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* MATCH INFO CARD */}
                <div className="bg-white p-8 rounded-xl shadow border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* League Selection */}
                    <div className="col-span-2">
                        <label className="label">Liga</label>
                        <select
                            className="input-field"
                            required
                            value={formData.league_id}
                            onChange={handleLeagueChange}
                            disabled={isEditing} // Prevent league change on edit to simplify logic
                        >
                            <option value="">Selecciona una Liga</option>
                            {leagues.map(l => (
                                <option key={l.id} value={l.id}>{l.name} (Temp. {l.season})</option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    <div className="col-span-2">
                        <label className="label">Categoría</label>
                        <select
                            className="input-field"
                            required
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">Seleccionar...</option>
                            {categories.map(cat => (
                                <option key={cat.name} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Teams */}
                    <div>
                        <label className="label">Equipo Local</label>
                        <select
                            className="input-field"
                            required
                            value={formData.home_team_id}
                            onChange={e => setFormData({ ...formData, home_team_id: e.target.value })}
                        >
                            <option value="">Seleccionar Local...</option>
                            {teams.filter(t => t.category === formData.category && t.id !== formData.away_team_id).map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Equipo Visitante</label>
                        <select
                            className="input-field"
                            required
                            value={formData.away_team_id}
                            onChange={e => setFormData({ ...formData, away_team_id: e.target.value })}
                        >
                            <option value="">Seleccionar Visitante...</option>
                            {teams.filter(t => t.category === formData.category && t.id !== formData.home_team_id).map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                        <label className="label">Fecha y Hora</label>
                        <input
                            type="datetime-local"
                            className="input-field"
                            value={formData.match_date}
                            onChange={e => setFormData({ ...formData, match_date: e.target.value })}
                        />
                    </div>

                    {/* Status Toggle */}
                    <div className="col-span-2 bg-slate-50 p-4 rounded-lg flex items-center justify-between border border-slate-200">
                        <span className="font-bold text-gray-700">¿Partido Finalizado?</span>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.status === 'finished'}
                                onChange={e => setFormData({ ...formData, status: e.target.checked ? 'finished' : 'scheduled' })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {/* Scores */}
                    {formData.status === 'finished' && (
                        <>
                            <div className="col-span-2 border-t pt-4">
                                <h3 className="font-bold text-lg mb-4 text-center text-secondary">Resultado Final</h3>
                            </div>
                            <div className="text-center">
                                <label className="label">Puntos Local</label>
                                <input
                                    type="number"
                                    className="input-field text-center text-3xl font-black text-secondary"
                                    value={formData.home_score}
                                    onChange={e => setFormData({ ...formData, home_score: e.target.value })}
                                />
                            </div>
                            <div className="text-center">
                                <label className="label">Puntos Visitante</label>
                                <input
                                    type="number"
                                    className="input-field text-center text-3xl font-black text-secondary"
                                    value={formData.away_score}
                                    onChange={e => setFormData({ ...formData, away_score: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 mt-2 flex justify-center">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 text-primary rounded"
                                        checked={formData.is_walkover}
                                        onChange={e => setFormData({ ...formData, is_walkover: e.target.checked })}
                                    />
                                    <span className="text-gray-700 font-medium">Marcador por Walkover (WO)</span>
                                </label>
                            </div>
                        </>
                    )}
                </div>

                {/* STATS TABLES - Only if Finished */}
                {formData.status === 'finished' && formData.home_team_id && formData.away_team_id && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="flex items-center gap-2 text-xl font-bold text-secondary px-2">
                            <Activity /> Planilla de Estadísticas
                        </div>

                        {/* Home Stats */}
                        <TeamStatsTable
                            teamName="Equipo Local"
                            players={homeRoster}
                            stats={stats}
                            updateStat={updateStat}
                        />

                        {/* Away Stats */}
                        <TeamStatsTable
                            teamName="Equipo Visitante"
                            players={awayRoster}
                            stats={stats}
                            updateStat={updateStat}
                        />
                    </div>
                )}


                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-secondary hover:bg-secondary-light text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2 text-lg"
                >
                    <Save size={24} />
                    {loading ? 'Guardando...' : (formData.status === 'finished' ? 'Guardar Partido y Estadísticas' : 'Guardar Partido')}
                </button>
            </form>
        </div>
    );
}

// Reusable Stats Table Component
function TeamStatsTable({ teamName, players, stats, updateStat }) {
    if (players.length === 0) return (
        <div className="bg-white p-6 rounded-xl shadow border border-slate-100 mb-6 text-center">
            <h2 className="text-xl font-bold mb-2 text-secondary">{teamName}</h2>
            <p className="text-gray-500 italic">Cargando plantilla o no hay jugadores disponibles...</p>
        </div>
    );

    const val = (playerId, field) => stats[playerId]?.[field] || '';

    const calculatePoints = (playerId) => {
        const p2 = parseInt(val(playerId, 'two_points_made') || 0) * 2;
        const p3 = parseInt(val(playerId, 'three_points_made') || 0) * 3;
        const p1 = parseInt(val(playerId, 'free_throws_made') || 0);
        return p2 + p3 + p1;
    };

    return (
        <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold text-secondary">{teamName}</h2>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">{players.length} jugadores</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-slate-100 text-gray-600 uppercase tracking-wider font-bold border-b border-gray-200">
                            <th colSpan="3" className="px-2 py-1 text-left border-r bg-slate-50">Jugador</th>
                            <th colSpan="2" className="px-2 py-1 text-center border-r bg-blue-50 text-blue-800">2 Pts</th>
                            <th colSpan="2" className="px-2 py-1 text-center border-r bg-orange-50 text-orange-800">3 Pts</th>
                            <th colSpan="2" className="px-2 py-1 text-center border-r bg-green-50 text-green-800">Libres</th>
                            <th colSpan="1" className="px-2 py-1 text-center border-r">Reb</th>
                            <th colSpan="5" className="px-2 py-1 text-center border-r">Juego</th>
                            <th colSpan="1" className="px-2 py-1 text-center bg-gray-100">Total</th>
                        </tr>
                        <tr className="bg-gray-50 text-gray-500 font-semibold border-b">
                            <th className="px-2 py-2 text-center w-8">#</th>
                            <th className="px-2 py-2 text-left min-w-[120px]">Nombre</th>
                            <th className="px-1 py-2 text-center w-10 border-r">Min</th>
                            <th className="px-1 py-1 text-center w-10 bg-blue-50/50">C</th>
                            <th className="px-1 py-1 text-center w-10 border-r bg-blue-50/50">I</th>
                            <th className="px-1 py-1 text-center w-10 bg-orange-50/50">C</th>
                            <th className="px-1 py-1 text-center w-10 border-r bg-orange-50/50">I</th>
                            <th className="px-1 py-1 text-center w-10 bg-green-50/50">C</th>
                            <th className="px-1 py-1 text-center w-10 border-r bg-green-50/50">I</th>
                            <th className="px-1 py-1 text-center w-10 border-r">RT</th>
                            <th className="px-1 py-1 text-center w-10">AS</th>
                            <th className="px-1 py-1 text-center w-10">RO</th>
                            <th className="px-1 py-1 text-center w-10">PE</th>
                            <th className="px-1 py-1 text-center w-10">TA</th>
                            <th className="px-1 py-1 text-center w-10 border-r text-red-600">FA</th>
                            <th className="px-2 py-2 text-center w-12 bg-gray-100 font-bold border-l">PTS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {players.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-2 py-2 text-center font-mono text-gray-400">{p.jersey_number}</td>
                                <td className="px-2 py-2 font-medium text-gray-900 truncate max-w-[120px]" title={`${p.first_name} ${p.last_name}`}>
                                    {p.last_name}, {p.first_name.charAt(0)}.
                                </td>
                                <td className="px-1 py-1 border-r">
                                    <input tabIndex="1" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1 focus:ring-1 focus:ring-primary" placeholder="-" value={val(p.id, 'minutes_played')} onChange={(e) => updateStat(p.id, 'minutes_played', e.target.value)} />
                                </td>
                                <td className="px-1 py-1 bg-blue-50/30"><input tabIndex="2" type="number" className="w-full text-center border-blue-100 rounded text-xs p-1 font-bold text-blue-900" value={val(p.id, 'two_points_made')} onChange={(e) => updateStat(p.id, 'two_points_made', e.target.value)} /></td>
                                <td className="px-1 py-1 border-r bg-blue-50/30"><input tabIndex="2" type="number" className="w-full text-center border-gray-100 rounded text-xs p-1 text-gray-400" placeholder="/" value={val(p.id, 'two_points_attempted')} onChange={(e) => updateStat(p.id, 'two_points_attempted', e.target.value)} /></td>
                                <td className="px-1 py-1 bg-orange-50/30"><input tabIndex="3" type="number" className="w-full text-center border-orange-100 rounded text-xs p-1 font-bold text-orange-900" value={val(p.id, 'three_points_made')} onChange={(e) => updateStat(p.id, 'three_points_made', e.target.value)} /></td>
                                <td className="px-1 py-1 border-r bg-orange-50/30"><input tabIndex="3" type="number" className="w-full text-center border-gray-100 rounded text-xs p-1 text-gray-400" placeholder="/" value={val(p.id, 'three_points_attempted')} onChange={(e) => updateStat(p.id, 'three_points_attempted', e.target.value)} /></td>
                                <td className="px-1 py-1 bg-green-50/30"><input tabIndex="4" type="number" className="w-full text-center border-green-100 rounded text-xs p-1 font-bold text-green-900" value={val(p.id, 'free_throws_made')} onChange={(e) => updateStat(p.id, 'free_throws_made', e.target.value)} /></td>
                                <td className="px-1 py-1 border-r bg-green-50/30"><input tabIndex="4" type="number" className="w-full text-center border-gray-100 rounded text-xs p-1 text-gray-400" placeholder="/" value={val(p.id, 'free_throws_attempted')} onChange={(e) => updateStat(p.id, 'free_throws_attempted', e.target.value)} /></td>
                                <td className="px-1 py-1 border-r"><input tabIndex="5" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1" value={val(p.id, 'rebounds')} onChange={(e) => updateStat(p.id, 'rebounds', e.target.value)} /></td>
                                <td className="px-1 py-1"><input tabIndex="6" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1" value={val(p.id, 'assists')} onChange={(e) => updateStat(p.id, 'assists', e.target.value)} /></td>
                                <td className="px-1 py-1"><input tabIndex="7" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1" value={val(p.id, 'steals')} onChange={(e) => updateStat(p.id, 'steals', e.target.value)} /></td>
                                <td className="px-1 py-1"><input tabIndex="8" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1" value={val(p.id, 'turnovers')} onChange={(e) => updateStat(p.id, 'turnovers', e.target.value)} /></td>
                                <td className="px-1 py-1"><input tabIndex="9" type="number" className="w-full text-center border-gray-200 rounded text-xs p-1" value={val(p.id, 'blocks')} onChange={(e) => updateStat(p.id, 'blocks', e.target.value)} /></td>
                                <td className="px-1 py-1 border-r"><input tabIndex="10" type="number" className="w-full text-center border-red-100 rounded text-xs p-1 text-red-600" value={val(p.id, 'fouls')} onChange={(e) => updateStat(p.id, 'fouls', e.target.value)} /></td>
                                <td className="px-2 py-2 bg-gray-100/50 text-center font-black text-gray-800 border-l">{calculatePoints(p.id)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
