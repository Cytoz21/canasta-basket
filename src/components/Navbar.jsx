import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Trophy, Users, Shield } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Inicio', path: '/' },
        { name: 'Jugadores', path: '/jugadores' },
        { name: 'Ligas', path: '/ligas' },
    ];

    return (
        <nav className="bg-secondary text-white sticky top-0 z-50 shadow-lg backdrop-blur-md bg-opacity-95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary p-2 rounded-full group-hover:bg-primary-light transition-colors">
                            <Trophy size={20} className="text-white" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-wider">
                            CANASTA <span className="text-primary-light">BASKET</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <div className="flex items-baseline space-x-4">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
                                            ? 'bg-secondary-light text-white'
                                            : 'text-gray-300 hover:bg-secondary-light hover:text-white'
                                        }`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                        </div>
                        {/* Admin Key */}
                        <Link
                            to="/login"
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors border border-gray-600 rounded px-2 py-1"
                        >
                            <Shield size={12} /> Admin
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-secondary-light focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-secondary border-t border-secondary-light">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `block px-3 py-2 rounded-md text-base font-medium ${isActive
                                        ? 'bg-secondary-light text-white'
                                        : 'text-gray-300 hover:bg-secondary-light hover:text-white'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                        <Link
                            to="/login"
                            onClick={() => setIsOpen(false)}
                            className="block flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:bg-secondary-light hover:text-white"
                        >
                            <Shield size={16} /> Admin Access
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
