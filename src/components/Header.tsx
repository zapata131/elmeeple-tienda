'use client';

import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#F5F0E9]/90 backdrop-blur-md border-b border-[#8367C7]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🎲</span>
          <div>
            <span className="text-xl font-extrabold text-[#3A3A3A] tracking-tight group-hover:text-[#8367C7] transition-colors">
              MeeplePrecios
            </span>
            <span className="ml-1.5 text-xs px-2 py-0.5 rounded bg-[#FF9E8A]/30 text-rose-950 font-bold">
              🇲🇽 MX
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#3A3A3A]">
          <Link href="/" className="hover:text-[#8367C7] transition-colors">
            Inicio
          </Link>
          <Link href="/search" className="hover:text-[#8367C7] transition-colors">
            Explorar catálogo
          </Link>
          <Link href="/merchant/dashboard" className="hover:text-[#8367C7] transition-colors">
            Portal de tiendas
          </Link>
          <Link href="/admin/queue" className="hover:text-[#8367C7] transition-colors">
            Moderación admin
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/merchant/onboard"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#8367C7] text-white hover:bg-[#8367C7]/90 transition-all shadow-sm"
          >
            Registrar tienda
          </Link>
          <Link
            href="/login"
            className="px-3 py-2 text-xs font-medium rounded-lg border border-[#3A3A3A]/20 hover:border-[#8367C7] transition-colors"
          >
            Ingresar
          </Link>
        </div>
      </div>
    </header>
  );
};
