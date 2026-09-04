import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-stone-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg text-[#3A3A3A]">MeeplePrecios 🇲🇽</span>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-md">
            Comparador independiente de precios de juegos de mesa para la comunidad lúdica en México. Precios y stock sincronizados directamente desde tiendas mexicanas verificadas.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500 font-medium">
          <Link href="/" className="hover:text-[#8367C7] transition-colors">
            Inicio
          </Link>
          <span className="text-stone-300">•</span>
          <span>Precios verificados</span>
          <span className="text-stone-300">•</span>
          <span>© {new Date().getFullYear()} MeeplePrecios</span>
        </div>
      </div>
    </footer>
  );
}
