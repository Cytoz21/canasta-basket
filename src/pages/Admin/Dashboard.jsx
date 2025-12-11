import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, LogOut, Shield, Trophy, Calendar, Tag } from 'lucide-react';
import { supabase } from '../../services/supabase';

export default function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-secondary">Panel de Administración</h1>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium">
                    <LogOut size={20} /> Cerrar Sesión
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/admin/players" className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col items-center text-center group">
                    <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
                        <Users size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary">Gestionar Jugadores</h3>
                    <p className="text-gray-500 mt-2 text-sm">Crear, editar o eliminar perfiles de jugadores.</p>
                </Link>

                <Link to="/admin/teams" className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col items-center text-center group">
                    <div className="bg-green-50 p-4 rounded-full mb-4 group-hover:bg-green-100 transition-colors">
                        <Shield size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary">Gestionar Clubes</h3>
                    <p className="text-gray-500 mt-2 text-sm">Administrar equipos y sus logotipos.</p>
                </Link>

                <Link to="/admin/leagues" className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col items-center text-center group">
                    <div className="bg-yellow-50 p-4 rounded-full mb-4 group-hover:bg-yellow-100 transition-colors">
                        <Trophy size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary">Gestionar Ligas</h3>
                    <p className="text-gray-500 mt-2 text-sm">Configurar torneos y temporadas.</p>
                </Link>

                <Link to="/admin/matches" className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col items-center text-center group">
                    <div className="bg-orange-50 p-4 rounded-full mb-4 group-hover:bg-orange-100 transition-colors">
                        <Calendar size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary">Gestionar Partidos</h3>
                    <p className="text-gray-500 mt-2 text-sm">Programar juegos y resultados.</p>
                </Link>
                <Link to="/admin/categories" className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col items-center text-center group">
                    <div className="bg-purple-50 p-4 rounded-full mb-4 group-hover:bg-purple-100 transition-colors">
                        <Tag size={32} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-secondary">Categorías</h3>
                    <p className="text-gray-500 mt-2 text-sm">Añadir o eliminar categorías de juego.</p>
                </Link>
            </div>
        </div>
    );
}
