import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-secondary text-gray-300 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold text-white">CANASTA BASKET</h3>
                        <p className="text-sm mt-1">Plataforma de Información de Básquetbol - Trujillo, Perú</p>
                    </div>
                    <div className="text-sm text-center md:text-right">
                        <p>&copy; {new Date().getFullYear()} Canasta Basket. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
