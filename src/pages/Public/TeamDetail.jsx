import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { ArrowLeft, User, Shield, Ruler, Hash } from 'lucide-react';

export default function TeamDetail() {
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeamData();
    }, [id]);

    async function fetchTeamData() {
        const { data: teamData } = await supabase.from('teams').select('*, league:leagues(name)').eq('id', id).single();
        setTeam(teamData);

        const { data: playersData } = await supabase
            .from('players')
            .select('*')
            .eq('team_id', id)
            .order('number_player', { ascending: true }); // Order by dorsal number

        setPlayers(playersData || []);
        setLoading(false);
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando equipo...</div>;
    if (!team) return <div className="p-8 text-center text-gray-500">Equipo no encontrado.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <Link to={`/leagues/${team.league_id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors font-medium">
                <ArrowLeft size={18} /> Volver a la Liga
            </Link>

            {/* Team Header */}
            <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="w-40 h-40 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg shrink-0">
                    {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-cover" /> : <Shield size={64} className="text-gray-300" />}
                </div>
                <div>
                    <h1 className="text-4xl font-black text-secondary mb-2">{team.name}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-500 text-sm font-medium">
                        <span className="bg-slate-100 px-3 py-1 rounded-full">{team.category}</span>
                        {team.league && <span className="bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1"><Shield size={14} /> {team.league.name}</span>}
                    </div>
                </div>
            </div>

            {/* Roster */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="text-primary" /> Plantilla de Jugadores
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {players.map(player => (
                    <div key={player.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-primary/20 transition-all flex items-center gap-4 group">
                        <div className="w-16 h-16 rounded-full bg-slate-50 overflow-hidden shrink-0 border border-slate-100 relative">
                            {player.photo_url ? (
                                <img src={player.photo_url} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                    <User size={24} />
                                </div>
                            )}
                            {player.number_player && (
                                <div className="absolute bottom-0 right-0 bg-primary text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-tl-lg">
                                    {player.number_player}
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                                {player.first_name} {player.last_name}
                            </h3>
                            <div className="flex flex-col text-xs text-gray-500 mt-1 gap-1">
                                {player.position && <span className="font-medium text-secondary">{player.position}</span>}
                                {player.height && (
                                    <span className="flex items-center gap-1">
                                        <Ruler size={12} /> {player.height} cm
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {players.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl text-gray-500">
                        No hay jugadores registrados en este equipo aún.
                    </div>
                )}
            </div>
        </div>
    );
}
