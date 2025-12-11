import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Save, ArrowLeft } from 'lucide-react';

export default function LeagueForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        season: new Date().getFullYear().toString(),
        city: ''
    });

    useEffect(() => {
        if (isEditing) fetchLeague();
    }, [id]);

    async function fetchLeague() {
        const { data } = await supabase.from('leagues').select('*').eq('id', id).single();
        if (data) setFormData(data);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            let error;
            if (isEditing) {
                ({ error } = await supabase.from('leagues').update(formData).eq('id', id));
            } else {
                ({ error } = await supabase.from('leagues').insert([formData]));
            }

            if (error) throw error;
            navigate('/admin/leagues');
        } catch (error) {
            alert('Error saving league: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/admin/leagues')} className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-secondary">
                    {isEditing ? 'Editar Liga' : 'Nueva Liga'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow border border-slate-100 space-y-6">

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="label">Nombre de la Liga</label>
                        <input
                            className="input-field"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej. Liga Nacional de Basket"
                        />
                    </div>
                    <div>
                        <label className="label">Temporada</label>
                        <input
                            className="input-field"
                            value={formData.season}
                            onChange={e => setFormData({ ...formData, season: e.target.value })}
                            placeholder="Ej. 2025"
                        />
                    </div>
                    <div>
                        <label className="label">Ciudad</label>
                        <input
                            className="input-field"
                            required
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                            placeholder="Ej. Lima"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-secondary hover:bg-secondary-light text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mt-6"
                >
                    <Save size={20} /> {loading ? 'Guardando...' : 'Guardar Liga'}
                </button>
            </form>
        </div>
    );
}
