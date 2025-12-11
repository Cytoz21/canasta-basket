import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ArrowLeft, Ruler, User, Calendar } from 'lucide-react';

export default function PlayerDetail() {
    const { id } = useParams();
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPlayer() {
            const { data, error } = await supabase
                .from('players')
                .select(`
          *,
          teams ( name, category, league_id )
        `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching player:', error);
            } else {
                setPlayer(data);
            }
            setLoading(false);
        }

        fetchPlayer();
    }, [id]);

    if (loading) return <div className="p-10 text-center">Cargando perfil...</div>;
    if (!player) return <div className="p-10 text-center">Jugador no encontrado</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <Link to="/jugadores" className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={20} /> Volver al listado
            </Link>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
                {/* Photo Section */}
                <div className="md:w-1/3 bg-slate-100 relative min-h-[300px]">
                    {player.photo_url ? (
                        <img
                            src={player.photo_url}
                            alt={`${player.first_name} ${player.last_name}`}
                            className="w-full h-full object-cover absolute inset-0"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <User size={64} />
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="p-8 md:w-2/3">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-secondary mb-1">
                                {player.first_name} <span className="text-primary">{player.last_name}</span>
                            </h1>
                            <p className="text-lg text-gray-600 font-medium">
                                {player.teams?.name} • {player.teams?.category}
                            </p>
                        </div>
                        <span className="bg-secondary text-white px-3 py-1 rounded text-sm font-bold">
                            {player.position || 'Jugador'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-8">
                        <div className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-slate-100">
                            <div className="bg-white p-2 rounded-full shadow-sm text-primary">
                                <Ruler size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Estatura</p>
                                <p className="text-xl font-bold text-secondary">{player.height} m</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-slate-100">
                            <div className="bg-white p-2 rounded-full shadow-sm text-primary">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Edad</p>
                                <p className="text-xl font-bold text-secondary">{player.age} años</p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Stats Placeholder */}
                    <div className="mt-8 border-t pt-6">
                        <h3 className="font-bold text-secondary mb-3">Estadísticas de Temporada</h3>
                        <p className="text-gray-500 text-sm italic">Las estadísticas detalladas estarán disponibles próximamente.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
