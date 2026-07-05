'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Toolbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className="bg-gray-900 border-b border-gray-800 text-white select-none sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3.5">
        
        {/* Brand Name / Logo */}
        <div className="flex items-center gap-4">
          {!isHome ? (
            <Link href="/" className="flex items-center gap-2.5 font-extrabold text-white text-lg hover:text-indigo-400 transition-colors">
              <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>MeeplePrecios <span className="text-sm" title="México">🇲🇽</span></span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 font-extrabold text-gray-200 text-base">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>MeeplePrecios <span className="text-xs">🇲🇽</span></span>
            </div>
          )}
        </div>

        {/* Clean Functional Navigation */}
        <nav className="flex items-center gap-6 text-xs font-bold text-gray-300">
          <Link
            href="/merchant/onboard"
            className="hover:text-white transition-colors text-indigo-400"
          >
            Dar de alta tienda
          </Link>

          <Link
            href="/merchant/dashboard"
            className="hover:text-white transition-colors"
          >
            Acceso socios
          </Link>
        </nav>

      </div>
    </header>
  );
}
