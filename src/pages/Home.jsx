import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Trophy, Activity } from 'lucide-react';

export default function Home() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-secondary text-white py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">
                        El Básquetbol de Trujillo <br /> <span className="text-primary">al Siguiente Nivel</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        La plataforma oficial para consultar jugadores, equipos y estadísticas de la liga local.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/jugadores" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold transition-transform hover:scale-105 flex items-center gap-2">
                            Ver Jugadores <ArrowRight size={20} />
                        </Link>
                        <Link to="/ligas" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-bold backdrop-blur-sm transition-all">
                            Explorar Ligas
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Users size={40} className="text-primary" />}
                            title="Perfiles de Jugadores"
                            desc="Consulta información detallada, fotos y estadísticas de cada jugador."
                        />
                        <FeatureCard
                            icon={<Trophy size={40} className="text-accent-yellow" />}
                            title="Ligas y Torneos"
                            desc="Sigue de cerca el desarrollo de los campeonatos locales."
                        />
                        <FeatureCard
                            icon={<Activity size={40} className="text-secondary-light" />}
                            title="Estadísticas"
                            desc="Monitoreo de rendimiento: puntos, rebotes, asistencias y eficiencia por partido."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-secondary mb-2">{title}</h3>
            <p className="text-gray-600">{desc}</p>
        </div>
    );
}
