import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Calendar, MapPin, Shield, Trophy, LayoutList, GripVertical } from 'lucide-react';

export default function LeagueDetail() {
    const { id } = useParams();
    const [league, setLeague] = useState(null);
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('standings'); // 'standings', 'matches', 'teams'
    const [selectedCategory, setSelectedCategory] = useState('Primera División');

    // Unique categories found in matches/teams
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchLeagueData();
    }, [id]);

    async function fetchLeagueData() {
        // 1. Fetch League Info
        const { data: leagueData } = await supabase.from('leagues').select('*').eq('id', id).single();
        setLeague(leagueData);

        // 2. Fetch Matches
        const { data: matchesData } = await supabase
            .from('matches')
            .select(`
                *,
                home_team:teams!home_team_id(name, logo_url),
                away_team:teams!away_team_id(name, logo_url)
            `)
            .eq('league_id', id)
            .order('match_date', { ascending: false });

        setMatches(matchesData || []);

        // 3. Fetch Teams
        const { data: teamsData } = await supabase
            .from('teams')
            .select('*')
            .eq('league_id', id);
        setTeams(teamsData || []);

        // Extract categories
        const matchCats = new Set((matchesData || []).map(m => m.category).filter(Boolean));
        const teamCats = new Set((teamsData || []).map(t => t.category).filter(Boolean));
        const allCats = Array.from(new Set([...matchCats, ...teamCats]));

        if (allCats.length > 0) {
            setCategories(allCats.sort());
            setSelectedCategory(allCats[0]);
        }

        setLoading(false);
    }

    // --- Standings Calculation ---
    const calculateStandings = (category) => {
        const stats = {};

        // Initialize stats for all teams in this category
        teams.filter(t => t.category === category).forEach(t => {
            stats[t.id] = {
                id: t.id,
                name: t.name,
                logo_url: t.logo_url,
                played: 0,
                won: 0,
                lost: 0,
                wo_lost: 0, // Walkovers received
                pf: 0, // Points For
                pa: 0, // Points Against
                diff: 0,
                points: 0
            };
        });

        // Process Matches
        matches.filter(m => m.category === category && m.status === 'finished').forEach(m => {
            const home = stats[m.home_team_id];
            const away = stats[m.away_team_id];

            // If teams are not in list (maybe deleted?), skip safely
            if (!home || !away) return;

            home.played += 1;
            away.played += 1;

            home.pf += m.home_score;
            home.pa += m.away_score;
            away.pf += m.away_score;
            away.pa += m.home_score;

            if (m.home_score > m.away_score) {
                // Home Wins
                home.won += 1;
                home.points += 2;

                // Away Lost
                away.lost += 1;
                if (!m.is_walkover) {
                    away.points += 1;
                } else {
                    away.wo_lost += 1;
                    // 0 points for WO loser
                }

            } else {
                // Away Wins
                away.won += 1;
                away.points += 2;

                // Home Lost
                home.lost += 1;
                if (!m.is_walkover) {
                    home.points += 1;
                } else {
                    home.wo_lost += 1;
                }
            }
        });

        // Calculate Diff and Sort
        return Object.values(stats).map(t => ({
            ...t,
            diff: t.pf - t.pa
        })).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.diff !== a.diff) return b.diff - a.diff;
            return b.pf - a.pf;
        });
    };

    const standings = calculateStandings(selectedCategory);
    const filteredMatches = matches.filter(m => m.category === selectedCategory);
    const filteredTeams = teams.filter(t => t.category === selectedCategory);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando datos del torneo...</div>;
    if (!league) return <div className="p-8 text-center text-gray-500">Liga no encontrada.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-sm font-bold text-primary mb-2 uppercase tracking-wide">
                        <MapPin size={16} /> {league.city || 'Ciudad no definida'}
                    </div>
                    <h1 className="text-4xl font-black text-secondary mb-2">{league.name}</h1>
                    <p className="text-xl text-gray-500">Temporada {league.season}</p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none"></div>
                <Trophy className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-100 transform rotate-12" size={120} />
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors ${selectedCategory === cat
                                ? 'bg-secondary text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-8">
                <button
                    onClick={() => setActiveTab('standings')}
                    className={`px-6 py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'standings'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <LayoutList size={18} /> Tabla de Posiciones
                </button>
                <button
                    onClick={() => setActiveTab('matches')}
                    className={`px-6 py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'matches'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Calendar size={18} /> Resultados y Fixture
                </button>
                <button
                    onClick={() => setActiveTab('teams')}
                    className={`px-6 py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'teams'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Shield size={18} /> Equipos
                </button>
            </div>

            {/* Content */}
            {activeTab === 'standings' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-slate-200">
                                    <th className="p-4 w-12 text-center">#</th>
                                    <th className="p-4">Equipo</th>
                                    <th className="p-4 text-center">PTS</th>
                                    <th className="p-4 text-center">PJ</th>
                                    <th className="p-4 text-center">G</th>
                                    <th className="p-4 text-center">P</th>
                                    <th className="p-4 text-center">DIF</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-gray-700">
                                {standings.map((team, index) => (
                                    <tr key={team.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-center font-bold text-gray-400">{index + 1}</td>
                                        <td className="p-4">
                                            <Link to={`/teams/${team.id}`} className="flex items-center gap-3 font-bold text-gray-900 hover:text-primary">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-cover" /> : <Shield size={16} className="text-gray-400" />}
                                                </div>
                                                {team.name}
                                            </Link>
                                        </td>
                                        <td className="p-4 text-center font-black text-secondary text-base">{team.points}</td>
                                        <td className="p-4 text-center">{team.played}</td>
                                        <td className="p-4 text-center text-green-600 font-medium">{team.won}</td>
                                        <td className="p-4 text-center text-red-600 font-medium">{team.lost}</td>
                                        <td className="p-4 text-center text-gray-500">{team.diff > 0 ? `+${team.diff}` : team.diff}</td>
                                    </tr>
                                ))}
                                {standings.length === 0 && (
                                    <tr><td colSpan="7" className="p-8 text-center text-gray-500">No hay datos suficientes para mostrar la tabla.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'matches' && (
                <div className="space-y-4">
                    {filteredMatches.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
                            <p className="text-gray-500">No hay partidos registrados en esta categoría.</p>
                        </div>
                    )}
                    {filteredMatches.map(match => (
                        <div key={match.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left min-w-[120px]">
                                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    {match.status === 'finished' ? 'Finalizado' : 'Programado'}
                                </span>
                                <span className="text-sm font-medium text-gray-600">
                                    {match.match_date ? new Date(match.match_date).toLocaleDateString() : 'Fecha TBD'}
                                </span>
                                {match.status === 'finished' && (
                                    <Link
                                        to={`/matches/${match.id}`}
                                        className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors"
                                    >
                                        <Trophy size={12} /> Ver Stats
                                    </Link>
                                )}
                            </div>

                            <div className="flex-1 flex items-center justify-center gap-8 w-full md:w-auto">
                                <div className="flex flex-col items-center gap-2 flex-1 text-center">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                                        {match.home_team?.logo_url ? <img src={match.home_team.logo_url} className="w-full h-full object-cover" /> : <Shield size={24} className="text-gray-300" />}
                                    </div>
                                    <span className="font-bold text-sm text-secondary line-clamp-2 leading-none h-8 flex items-center">{match.home_team?.name}</span>
                                </div>

                                <div className="flex flex-col items-center">
                                    {match.status === 'finished' ? (
                                        <div className="text-3xl font-black text-gray-900 tracking-tight">
                                            {match.home_score} <span className="text-gray-300 mx-1">-</span> {match.away_score}
                                        </div>
                                    ) : (
                                        <div className="text-xl font-bold text-gray-300 bg-slate-50 px-3 py-1 rounded">VS</div>
                                    )}
                                </div>

                                <div className="flex flex-col items-center gap-2 flex-1 text-center">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                                        {match.away_team?.logo_url ? <img src={match.away_team.logo_url} className="w-full h-full object-cover" /> : <Shield size={24} className="text-gray-300" />}
                                    </div>
                                    <span className="font-bold text-sm text-secondary line-clamp-2 leading-none h-8 flex items-center">{match.away_team?.name}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'teams' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredTeams.map(team => (
                        <Link key={team.id} to={`/teams/${team.id}`} className="bg-white p-6 rounded-xl shadow-sm hover:shadow border border-slate-100 flex flex-col items-center text-center transition-all group">
                            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden mb-4 border border-slate-100 group-hover:scale-105 transition-transform">
                                {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-cover" /> : <Shield size={48} className="text-slate-300" />}
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">{team.name}</h3>
                            <p className="text-sm text-gray-500">{team.category}</p>
                        </Link>
                    ))}
                    {filteredTeams.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500">No hay equipos registrados en esta categoría.</div>
                    )}
                </div>
            )}
        </div>
    );
}
