'use client';

import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#F5F0E9]/95 backdrop-blur-md border-b border-gray-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl">🎲</span>
          <span className="text-base font-bold text-[#3A3A3A] tracking-tight group-hover:text-[#8367C7] transition-colors">
            MeeplePrecios
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200/80 text-gray-700 font-medium">
            México
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-gray-600">
          <Link href="/" className="hover:text-[#3A3A3A] transition-colors">
            Inicio
          </Link>
          <Link href="/search" className="hover:text-[#3A3A3A] transition-colors">
            Catálogo
          </Link>
          <Link href="/merchant/dashboard" className="hover:text-[#3A3A3A] transition-colors">
            Tiendas
          </Link>
          <Link href="/admin/queue" className="hover:text-[#3A3A3A] transition-colors">
            Moderación
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/merchant/onboard"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3A3A3A] text-white hover:bg-black transition-all shadow-xs"
          >
            Registrar tienda
          </Link>
          <Link
            href="/login"
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors"
          >
            Ingresar
          </Link>
        </div>
      </div>
    </header>
  );
};
