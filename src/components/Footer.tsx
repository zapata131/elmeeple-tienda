import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#3A3A3A] text-white mt-20 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎲</span>
              <span className="text-xl font-bold text-white">MeeplePrecios 🇲🇽</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              El primer comparador de precios de juegos de mesa para México. Centralizamos inventario y costo total de envío entregado.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#73D8D4] mb-3">Jugadores</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><Link href="/" className="hover:text-white">Búsqueda directa</Link></li>
              <li><Link href="/search" className="hover:text-white">Tendencias BGG</Link></li>
              <li><Link href="/search?filter=es" className="hover:text-white">Ediciones en español</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#73D8D4] mb-3">Socios comerciales</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><Link href="/merchant/onboard" className="hover:text-white">Registrar nueva tienda</Link></li>
              <li><Link href="/merchant/dashboard" className="hover:text-white">Portal de autoservicio</Link></li>
              <li><Link href="/merchant/shipping" className="hover:text-white">Matriz de tarifas de envío</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#73D8D4] mb-3">Administración</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li><Link href="/admin/queue" className="hover:text-white">Cola de moderación</Link></li>
              <li><Link href="/login" className="hover:text-white">Cambiar de persona</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} MeeplePrecios 🇲🇽. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
