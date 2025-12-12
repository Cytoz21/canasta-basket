import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function PlayerManager() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPlayers();
    }, []);

    async function fetchPlayers() {
        const { data, error } = await supabase
            .from('players')
            .select(`
                *,
                player_team_seasons (
                    season,
                    teams ( name, category )
                )
            `)
            .order('created_at', { ascending: false });

        if (error) console.error('Error:', error);
        else {
            // Process data for easier rendering
            const processed = (data || []).map(p => {
                // Find latest season/team
                const seasons = p.player_team_seasons || [];
                seasons.sort((a, b) => b.season.localeCompare(a.season));
                const current = seasons[0];
                return {
                    ...p,
                    team_name: current?.teams?.name,
                    team_category: current?.teams?.category
                };
            });
            setPlayers(processed);
        }
        setLoading(false);
    }

    async function handleDelete(id) {
        if (!window.confirm('¿Estás seguro de eliminar este jugador?')) return;

        const { error } = await supabase
            .from('players')
            .delete()
            .eq('id', id);

        if (error) alert('Error al eliminar');
        else fetchPlayers(); // Refresh
    }

    const filteredPlayers = players.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-secondary">Gestión de Jugadores</h1>
                <Link to="/admin/players/new" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus size={20} /> Nuevo Jugador
                </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6 border border-slate-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jugador</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="4" className="p-4 text-center">Cargando...</td></tr>
                        ) : filteredPlayers.map((player) => (
                            <tr key={player.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            {player.photo_url ? (
                                                <img className="h-10 w-10 rounded-full object-cover" src={player.photo_url} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{player.first_name} {player.last_name}</div>
                                            <div className="text-sm text-gray-500">{player.position}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.team_name || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.team_category || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/admin/players/${player.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4 inline-block">
                                        <Edit size={18} />
                                    </Link>
                                    <button onClick={() => handleDelete(player.id)} className="text-red-600 hover:text-red-900 inline-block">
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
