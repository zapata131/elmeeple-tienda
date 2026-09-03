'use client';

import React from 'react';
import Link from 'next/link';
import { SearchBar } from './SearchBar';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-[#8367C7] flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:scale-105 transition-transform">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight text-[#3A3A3A] leading-none">
              MeeplePrecios
            </span>
            <span className="text-[10px] font-medium text-stone-400 leading-tight">
              Comparador de juegos de mesa en México
            </span>
          </div>
        </Link>

        {/* Global Predictive Search */}
        <div className="flex-1 max-w-xl hidden md:block">
          <SearchBar />
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-4 text-sm font-medium text-stone-600">
          <Link
            href="/"
            className="hover:text-[#8367C7] transition-colors py-1 px-2 rounded-lg"
          >
            Inicio
          </Link>
          <a
            href="https://github.com/zapata131/elmeeple-tienda"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#8367C7] bg-[#8367C7]/10 hover:bg-[#8367C7]/20 transition-colors"
          >
            Comunidad 🇲🇽
          </a>
        </nav>
      </div>
      {/* Mobile search bar */}
      <div className="p-3 border-t border-stone-100 md:hidden bg-stone-50">
        <SearchBar />
      </div>
    </header>
  );
}
