import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Save, ArrowLeft, Upload } from 'lucide-react';

export default function PlayerForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([]);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        age: '',
        height: '',
        position: '',
        photo_url: ''
    });

    // Estado separado para la temporada actual/asignación
    const [seasonData, setSeasonData] = useState({
        team_id: '',
        season: new Date().getFullYear().toString(),
        jersey_number: ''
    });

    useEffect(() => {
        fetchTeams();
        if (isEditing) fetchPlayer();
    }, [id]);

    async function fetchTeams() {
        const { data } = await supabase.from('teams').select('id, name, category');
        setTeams(data || []);
    }

    async function fetchPlayer() {
        const { data: player } = await supabase.from('players').select('*').eq('id', id).single();
        if (player) {
            setFormData(player);

            // Fetch latest season data if exists
            const { data: season } = await supabase
                .from('player_team_seasons')
                .select('*')
                .eq('player_id', id)
                .order('season', { ascending: false })
                .limit(1)
                .single();

            if (season) {
                setSeasonData({
                    team_id: season.team_id,
                    season: season.season,
                    jersey_number: season.jersey_number || ''
                });
            }
        }
    }

    async function handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data } = supabase.storage.from('photos').getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, photo_url: data.publicUrl }));
        } catch (error) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const playerPayload = { ...formData };
        if (playerPayload.age === '') playerPayload.age = null;
        if (playerPayload.height === '') playerPayload.height = null;

        try {
            let playerId = id;
            let error;

            // 1. Save Player Core Data
            if (isEditing) {
                ({ error } = await supabase.from('players').update(playerPayload).eq('id', id));
            } else {
                const { data: newPlayer, error: insertError } = await supabase.from('players').insert([playerPayload]).select().single();
                error = insertError;
                if (newPlayer) playerId = newPlayer.id;
            }

            if (error) throw error;

            // 2. Save Season/Team Data (if team is selected)
            if (seasonData.team_id && seasonData.season) {
                // Get League ID from Team
                const { data: team } = await supabase.from('teams').select('league_id').eq('id', seasonData.team_id).single();

                if (team) {
                    const seasonPayload = {
                        player_id: playerId,
                        team_id: seasonData.team_id,
                        league_id: team.league_id,
                        season: seasonData.season,
                        jersey_number: seasonData.jersey_number || null
                    };

                    // Upsert based on unique constraint (player_id, team_id, league_id, season)
                    // Note: Supabase upsert needs all unique columns to match for update, or it inserts.
                    // For simplicity, we just insert and ignore conflicts or we try to upsert matching ID if we knew it.
                    // Let's just standard insert/upsert.
                    const { error: seasonError } = await supabase
                        .from('player_team_seasons')
                        .upsert(seasonPayload, { onConflict: 'player_id, team_id, league_id, season' });

                    if (seasonError) console.error("Error saving season:", seasonError);
                }
            }

            navigate('/admin/players');
        } catch (error) {
            alert('Error saving player: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/admin/players')} className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-secondary">
                    {isEditing ? 'Editar Jugador' : 'Nuevo Jugador'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow border border-slate-100 space-y-6">

                {/* Photo Upload */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden mb-4 relative group">
                        {formData.photo_url ? (
                            <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <Upload size={32} />
                            </div>
                        )}
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-white text-xs font-bold">Cambiar Foto</span>
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                    </div>
                    {!formData.photo_url && (
                        <label className="cursor-pointer text-primary text-sm font-bold hover:underline">
                            Subir Fotografía
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="label">Nombres</label>
                        <input
                            className="input-field"
                            required
                            value={formData.first_name}
                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="label">Apellidos</label>
                        <input
                            className="input-field"
                            required
                            value={formData.last_name}
                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label">Posición</label>
                        <select
                            className="input-field"
                            value={formData.position}
                            onChange={e => setFormData({ ...formData, position: e.target.value })}
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Base">Base</option>
                            <option value="Escolta">Escolta</option>
                            <option value="Alero">Alero</option>
                            <option value="Ala-Pívot">Ala-Pívot</option>
                            <option value="Pívot">Pívot</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 border-t pt-4 mt-2">
                        <h3 className="font-bold text-gray-700 mb-4">Temporada Actual / Asignación</h3>
                    </div>

                    <div>
                        <label className="label">Temporada</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Ej. 2024"
                            value={seasonData.season}
                            onChange={e => setSeasonData({ ...seasonData, season: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label">Equipo</label>
                        <select
                            className="input-field"
                            value={seasonData.team_id}
                            onChange={e => setSeasonData({ ...seasonData, team_id: e.target.value })}
                        >
                            <option value="">Sin equipo</option>
                            {teams.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Número (Dorsal)</label>
                        <input
                            type="number"
                            className="input-field"
                            value={seasonData.jersey_number}
                            onChange={e => setSeasonData({ ...seasonData, jersey_number: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label">Edad</label>
                        <input
                            type="number"
                            className="input-field"
                            value={formData.age}
                            onChange={e => setFormData({ ...formData, age: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="label">Estatura (m)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="input-field"
                            placeholder="1.85"
                            value={formData.height}
                            onChange={e => setFormData({ ...formData, height: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-secondary hover:bg-secondary-light text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mt-6"
                >
                    <Save size={20} /> {loading ? 'Guardando...' : 'Guardar Jugador'}
                </button>
            </form>
        </div>
    );
}

// Simple CSS helper via inline style or class in index.css would be better, but doing inline class for simplicity of this file
// "input-field": "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary outline-none bg-slate-50 border-slate-200"
// "label": "block text-sm font-medium text-gray-700 mb-1"
