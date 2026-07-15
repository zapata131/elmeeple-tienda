import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-gray-600 mt-16 border-t border-gray-200 text-xs">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎲</span>
            <span className="font-bold text-[#3A3A3A]">MeeplePrecios</span>
            <span className="text-gray-400">• Comparador de juegos de mesa en México</span>
          </div>

          <div className="flex items-center gap-5 text-gray-500">
            <Link href="/" className="hover:text-gray-900">Inicio</Link>
            <Link href="/search" className="hover:text-gray-900">Catálogo</Link>
            <Link href="/merchant/onboard" className="hover:text-gray-900">Registrar tienda</Link>
            <Link href="/merchant/dashboard" className="hover:text-gray-900">Portal tiendas</Link>
            <Link href="/admin/queue" className="hover:text-gray-900">Moderación</Link>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-gray-400">
          <p>© {new Date().getFullYear()} MeeplePrecios. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
