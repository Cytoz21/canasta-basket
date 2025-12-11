import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Save, ArrowLeft, Upload, Shield } from 'lucide-react';

export default function TeamForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [leagues, setLeagues] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        logo_url: '',
        league_id: ''
    });

    useEffect(() => {
        fetchLeagues();
        if (isEditing) fetchTeam();
    }, [id]);

    async function fetchLeagues() {
        // Fetch Leagues
        const { data: leaguesData } = await supabase.from('leagues').select('id, name');
        setLeagues(leaguesData || []);

        // Fetch Categories
        const { data: catData } = await supabase.from('categories').select('name').order('name');
        if (catData) setCategories(catData);
    }

    async function fetchTeam() {
        const { data } = await supabase.from('teams').select('*').eq('id', id).single();
        if (data) setFormData(data);
    }

    async function handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `team-logo-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, logo_url: data.publicUrl }));
        } catch (error) {
            alert('Error uploading logo: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const payload = { ...formData };
        if (!payload.league_id) {
            alert('Por favor selecciona una liga');
            setLoading(false);
            return;
        }

        try {
            let error;
            if (isEditing) {
                ({ error } = await supabase.from('teams').update(payload).eq('id', id));
            } else {
                ({ error } = await supabase.from('teams').insert([payload]));
            }

            if (error) throw error;
            navigate('/admin/teams');
        } catch (error) {
            alert('Error saving team: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/admin/teams')} className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-secondary">
                    {isEditing ? 'Editar Club' : 'Nuevo Club'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow border border-slate-100 space-y-6">

                {/* Logo Upload */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden mb-4 relative group flex items-center justify-center border-2 border-slate-100">
                        {formData.logo_url ? (
                            <img src={formData.logo_url} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <Shield size={48} className="text-gray-300" />
                        )}
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-white text-xs font-bold">Cambiar Logo</span>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                    </div>
                    {!formData.logo_url && (
                        <label className="cursor-pointer text-primary text-sm font-bold hover:underline">
                            Subir Logotipo
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="label">Nombre del Club</label>
                        <input
                            className="input-field"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej. Los Leones"
                        />
                    </div>

                    <div>
                        <label className="label">Liga</label>
                        <select
                            className="input-field"
                            required
                            value={formData.league_id}
                            onChange={e => setFormData({ ...formData, league_id: e.target.value })}
                        >
                            <option value="">Seleccionar Liga...</option>
                            {leagues.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Categoría</label>
                        <select
                            className="input-field"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">Seleccionar...</option>
                            {categories.map(cat => (
                                <option key={cat.name} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-secondary hover:bg-secondary-light text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mt-6"
                >
                    <Save size={20} /> {loading ? 'Guardando...' : 'Guardar Club'}
                </button>
            </form>
        </div>
    );
}
