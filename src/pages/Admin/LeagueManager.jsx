import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Plus, Edit, Trash2, Search, Trophy } from 'lucide-react';

export default function LeagueManager() {
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLeagues();
    }, []);

    async function fetchLeagues() {
        // Trying to fetch from leagues table. If it fails, we handle error
        const { data, error } = await supabase
            .from('leagues')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error:', error);
        } else {
            setLeagues(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id) {
        if (!window.confirm('¿Estás seguro de eliminar esta liga?')) return;

        const { error } = await supabase
            .from('leagues')
            .delete()
            .eq('id', id);

        if (error) alert('Error al eliminar');
        else fetchLeagues();
    }

    const filteredLeagues = leagues.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-secondary">Gestión de Ligas</h1>
                <Link to="/admin/leagues/new" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus size={20} /> Nueva Liga
                </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6 border border-slate-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre de liga..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-secondary"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-100">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liga</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temporada</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="3" className="p-4 text-center">Cargando...</td></tr>
                        ) : filteredLeagues.length === 0 ? (
                            <tr><td colSpan="3" className="p-8 text-center text-gray-400">No hay ligas registradas</td></tr>
                        ) : filteredLeagues.map((league) => (
                            <tr key={league.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                            <Trophy size={20} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{league.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{league.season || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/admin/leagues/${league.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4 inline-block">
                                        <Edit size={18} />
                                    </Link>
                                    <button onClick={() => handleDelete(league.id)} className="text-red-600 hover:text-red-900 inline-block">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
