import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

export default function PlayerList() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlayers();
    }, []);

    async function fetchPlayers() {
        try {
            const { data, error } = await supabase
                .from('players')
                .select(`
          id, 
          first_name, 
          last_name, 
          position, 
          photo_url,
          player_team_seasons (
            season,
            teams ( name )
          )
        `)
                .order('last_name', { ascending: true });

            if (error) throw error;
            setPlayers(data || []);
        } catch (error) {
            console.error('Error fetching players:', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-display font-bold text-secondary">Jugadores</h1>
                {/* Filters could go here */}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                            <div className="h-64 bg-gray-100 animate-pulse"></div>
                            <div className="p-4 space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {players.map((player) => (
                        <Link key={player.id} to={`/jugadores/${player.id}`} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:-translate-y-1">
                            <div className="relative h-72 bg-gray-50 overflow-hidden">
                                {player.photo_url ? (
                                    <img
                                        src={player.photo_url}
                                        alt={`${player.first_name}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300">
                                        <User size={64} />
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <p className="text-white font-bold truncate">{player.first_name} {player.last_name}</p>
                                    <p className="text-gray-200 text-xs">
                                        {player.player_team_seasons?.[0]?.teams?.name || 'Sin Equipo'}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 relative">
                                <span className="absolute -top-4 right-4 bg-primary text-white text-xs px-2 py-1 rounded shadow-sm">
                                    {player.position || 'Jugador'}
                                </span>
                                <div className="pt-1 flex justify-between items-center text-sm text-gray-500">
                                    <span>Ver perfil completo</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && players.length === 0 && (
                <div className="text-center py-20 bg-surface rounded-xl">
                    <p className="text-gray-500">No hay jugadores registrados aún.</p>
                </div>
            )}
        </div>
    );
}
