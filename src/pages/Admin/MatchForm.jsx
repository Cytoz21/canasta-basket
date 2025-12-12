import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';

export default function MatchForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [leagues, setLeagues] = useState([]);
    const [categories, setCategories] = useState([]);
    const [teams, setTeams] = useState([]);

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
    }, []);

    // Fetch leagues and categories
    async function fetchLeagues() {
        const { data: leaguesData } = await supabase.from('leagues').select('id, name');
        setLeagues(leaguesData || []);

        const { data: catData } = await supabase.from('categories').select('name').order('name');
        if (catData) setCategories(catData);
    }

    // When league changes, fetch teams from that league (if we had league_id in teams, but for now we fetch all teams and filter)
    // Actually, teams table has league_id now.
    async function fetchTeams(leagueId) {
        if (!leagueId) return;
        const { data } = await supabase.from('teams').select('id, name, category').eq('league_id', leagueId);
        setTeams(data || []);
        // Reset team selection on league change
        setFormData(prev => ({ ...prev, home_team_id: '', away_team_id: '' }));
    }

    const handleLeagueChange = (e) => {
        const leagueId = e.target.value;
        setFormData({ ...formData, league_id: leagueId });
        fetchTeams(leagueId);
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const payload = { ...formData };

        // Calculate winner if finished
        if (payload.status === 'finished') {
            if (payload.is_walkover) {
                // If WO, we need to know who won. For simplicity, let's assume the scorer > 0 won or add a UI selector.
                // Standard WO is usually 20-0 in FIBA rules.
                // Let's rely on scores entered.
            }

            if (parseInt(payload.home_score) > parseInt(payload.away_score)) {
                payload.winner_id = payload.home_team_id;
            } else if (parseInt(payload.away_score) > parseInt(payload.home_score)) {
                payload.winner_id = payload.away_team_id;
            } else {
                payload.winner_id = null; // Draw
            }
        }

        let matchId = id;
        if (isEditing) {
            ({ error } = await supabase.from('matches').update(payload).eq('id', id));
        } else {
            const { data, error: insertError } = await supabase.from('matches').insert([payload]).select().single();
            error = insertError;
            if (data) matchId = data.id;
        }

        if (error) throw error;

        if (payload.status === 'finished') {
            navigate(`/admin/matches/${matchId}/stats`);
        } else {
            navigate('/admin/matches');
        }
        setLoading(false);
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/admin/matches')} className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-secondary">Registrar Nuevo Partido</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow border border-slate-100 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* League Selection */}
                    <div className="col-span-2">
                        <label className="label">Liga</label>
                        <select
                            className="input-field"
                            required
                            value={formData.league_id}
                            onChange={handleLeagueChange}
                        >
                            <option value="">Selecciona una Liga</option>
                            {leagues.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
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
                    <div className="col-span-2 bg-slate-50 p-4 rounded-lg flex items-center justify-between">
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

                    {/* Scores (Only if finished) */}
                    {formData.status === 'finished' && (
                        <>
                            <div className="col-span-2 border-t pt-4">
                                <h3 className="font-bold text-lg mb-4 text-center text-secondary">Resultado Final</h3>
                            </div>
                            <div className="text-center">
                                <label className="label">Puntos Local</label>
                                <input
                                    type="number"
                                    className="input-field text-center text-2xl font-bold"
                                    value={formData.home_score}
                                    onChange={e => setFormData({ ...formData, home_score: e.target.value })}
                                />
                            </div>
                            <div className="text-center">
                                <label className="label">Puntos Visitante</label>
                                <input
                                    type="number"
                                    className="input-field text-center text-2xl font-bold"
                                    value={formData.away_score}
                                    onChange={e => setFormData({ ...formData, away_score: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 text-primary"
                                        checked={formData.is_walkover}
                                        onChange={e => setFormData({ ...formData, is_walkover: e.target.checked })}
                                    />
                                    <span className="text-gray-700 font-medium">Fue Walkover (WO)</span>
                                </label>
                                <p className="text-xs text-gray-400 mt-1 ml-7">Si marcas WO, el perdedor obtendrá 0 puntos en la tabla.</p>
                            </div>
                        </>
                    )}

                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-secondary hover:bg-secondary-light text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mt-6"
                >
                    <Save size={20} />
                    {loading ? 'Guardando...' : (formData.status === 'finished' ? 'Guardar y Registrar Estadísticas' : 'Guardar Partido')}
                </button>
            </form>
        </div>
    );
}
