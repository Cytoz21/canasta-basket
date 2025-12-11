import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Plus, Trash2, ArrowLeft, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (!error) setCategories(data || []);
        setLoading(false);
    }

    async function handleAdd(e) {
        e.preventDefault();
        if (!newCategory.trim()) return;

        const { error } = await supabase
            .from('categories')
            .insert([{ name: newCategory.trim() }]);

        if (error) {
            alert('Error al crear categoría: ' + error.message);
        } else {
            setNewCategory('');
            fetchCategories();
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('¿Seguro que deseas eliminar esta categoría?')) return;

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            fetchCategories();
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/admin" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-secondary">Gestión de Categorías</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-secondary">
                        <Plus size={20} /> Nueva Categoría
                    </h2>
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="text"
                            className="input-field flex-1"
                            placeholder="Ej. Sub-20, Senior..."
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold transition-colors"
                        >
                            Agregar
                        </button>
                    </form>
                    <p className="text-xs text-gray-400 mt-4">
                        Estas categorías estarán disponibles al crear Equipos y programar Partidos.
                    </p>
                </div>

                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                        <h2 className="font-bold text-gray-700">Categorías Existentes</h2>
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {loading && <li className="p-4 text-center text-gray-400">Cargando...</li>}
                        {!loading && categories.length === 0 && <li className="p-4 text-center text-gray-400">No hay categorías registradas.</li>}

                        {categories.map(cat => (
                            <li key={cat.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <Tag size={16} className="text-gray-400 group-hover:text-primary" />
                                    <span className="font-medium text-gray-700">{cat.name}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="text-gray-400 hover:text-red-600 transition-colors p-2"
                                    title="Eliminar"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
