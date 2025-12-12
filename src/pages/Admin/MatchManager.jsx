import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Plus, Trophy, ArrowRight, Shield, Activity } from 'lucide-react';

export default function MatchManager() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, []);

    async function fetchMatches() {
        const { data, error } = await supabase
            .from('matches')
            .select(`
                *,
                league:leagues(name),
                home_team:teams!home_team_id(name),
                away_team:teams!away_team_id(name)
            `)
            .order('match_date', { ascending: false });

        if (!error) {
            setMatches(data);
        }
        setLoading(false);
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-secondary">Gestión de Partidos</h1>
                <Link to="/admin/matches/new" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus size={20} /> Registrar Partido
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Liga / Cat</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Local</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Resultado</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Visitante</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading && <tr><td colSpan="6" className="p-8 text-center text-gray-500">Cargando partidos...</td></tr>}
                        {!loading && matches.length === 0 && (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">No hay partidos registrados</td></tr>
                        )}
                        {matches.map((match) => (
                            <tr key={match.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {match.match_date ? new Date(match.match_date).toLocaleDateString() : 'Por definir'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">{match.league?.name}</div>
                                    <div className="text-xs text-gray-500">{match.category}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-secondary">
                                    {match.home_team?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="px-3 py-1 bg-slate-100 rounded-lg font-mono font-bold text-lg border border-slate-200">
                                        {match.home_score} - {match.away_score}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-secondary">
                                    {match.away_team?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${match.status === 'finished'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {match.status === 'finished' ? 'Finalizado' : 'Programado'}
                                    </span>
                                    <Link to={`/admin/matches/${match.id}/stats`} className="ml-4 inline-flex items-center text-primary hover:text-primary-dark" title="Estadísticas">
                                        <Activity size={18} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
