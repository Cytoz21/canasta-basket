import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Trophy, MapPin, Calendar } from 'lucide-react';

export default function LeagueList() {
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeagues();
    }, []);

    async function fetchLeagues() {
        const { data, error } = await supabase
            .from('leagues')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setLeagues(data);
        setLoading(false);
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-secondary mb-4">Ligas y Torneos</h1>
                <p className="text-lg text-gray-600">Encuentra tu liga, revisa los resultados y la tabla de posiciones.</p>
            </div>

            {loading ? (
                <div className="text-center py-12">Cargando ligas...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {leagues.map(league => (
                        <Link key={league.id} to={`/leagues/${league.id}`} className="group block">
                            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 h-full flex flex-col">
                                <div className="bg-gradient-to-r from-secondary to-primary h-32 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                    <Trophy size={48} className="text-white relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                                        {league.name}
                                    </h2>
                                    <div className="space-y-2 text-sm text-gray-500 mb-6 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span>Temporada {league.season}</span>
                                        </div>
                                        {league.city && (
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} />
                                                <span>{league.city}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full bg-slate-50 text-secondary font-bold py-3 rounded-xl text-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        Ver Detalles
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {leagues.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl">
                            <p className="text-gray-500">No hay ligas activas en este momento.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
