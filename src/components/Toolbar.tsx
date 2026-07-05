/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';



const languages = [
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
];

const roles = [
  { id: 'player', label: 'Comprador' },
  { id: 'partner', label: 'Tienda' },
  { id: 'admin', label: 'Admin' },
];

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function Toolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [language, setLanguage] = useState('es'); // Default Spanish
  const [role, setRole] = useState('player');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  useEffect(() => {
    document.cookie = 'meeple_country=MX; path=/; max-age=31536000; SameSite=Lax';
    document.cookie = 'meeple_currency=MXN; path=/; max-age=31536000; SameSite=Lax';
    const savedLang = getCookie('meeple_language');
    const savedRole = getCookie('meeple_role');

    if (savedLang) setLanguage(savedLang);
    if (savedRole) setRole(savedRole);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLanguage(val);
    document.cookie = `meeple_language=${val}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };


  const triggerSeed = async () => {
    setIsSeeding(true);
    setSeedMsg('');
    try {
      const res = await fetch('/api/admin/seed-data', { method: 'POST' });
      if (res.ok) {
        setSeedMsg('¡Catálogo de 22 juegos y 12 tiendas cargado!');
        setTimeout(() => setSeedMsg(''), 4000);
        router.refresh();
      }
    } catch {
      setSeedMsg('Error al cargar datos');
    } finally {
      setIsSeeding(false);
    }
  };

  const isHome = pathname === '/';

  return (
    <div className="bg-gray-900 border-b border-gray-800 text-white select-none">
      {/* Top Main Toolbar Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3">
        
        {/* Brand Name / Logo when not on Main Page */}
        <div className="flex items-center gap-4">
          {!isHome && (
            <Link href="/" className="flex items-center gap-2 font-extrabold text-white text-base hover:text-indigo-400 transition-colors">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>MeeplePrecios</span>
            </Link>
          )}

          {/* Role Switcher Pill Bar */}
          <div className="flex items-center bg-gray-800/80 rounded-lg p-1 border border-gray-700">
            <span className="text-[10px] uppercase font-bold text-gray-400 px-2">Perfil:</span>
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setRole(r.id);
                  document.cookie = `meeple_role=${r.id}; path=/; max-age=31536000; SameSite=Lax`;
                  router.refresh();
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                  role === r.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Settings */}
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          

          {/* Market Lock Badge (Mexico / MXN) */}
          <div data-testid="market-lock-badge" className="flex items-center gap-1.5 bg-gray-800 text-gray-300 text-xs font-bold rounded-lg px-3 py-1.5 border border-gray-700 select-none">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>México · $ MXN</span>
          </div>

          {/* Language Selector (Default Spanish) */}
          <div className="flex items-center gap-1.5">
            <select
              aria-label="idioma"
              value={language}
              onChange={handleLanguageChange}
              className="bg-gray-800 text-indigo-300 text-xs font-bold rounded-lg px-2.5 py-1.5 border border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Role-Specific Secondary Navigation Row */}
      <div className="bg-gray-950 px-6 py-2 border-t border-gray-800/80 flex items-center justify-between text-xs font-semibold text-gray-400">
        <div className="flex items-center gap-6">
          <span className="text-gray-500 uppercase font-mono text-[10px] tracking-wider">
            Navegación por rol ({role.toUpperCase()}):
          </span>

          {role === 'player' && (
            <>
              <Link href="/catalog" className="hover:text-white transition-colors">Catálogo completo</Link>
            </>
          )}

          {role === 'partner' && (
            <>
              <Link href="/merchant/dashboard" className="text-[#73D8D4] hover:text-[#73D8D4]/80 font-bold transition-colors inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Panel tienda</span>
              </Link>
              <Link href="/merchant/onboard" className="hover:text-white transition-colors">Dar de alta tienda</Link>
              <Link href="/merchant/shipping" className="hover:text-white transition-colors">Tarifas de envío</Link>
              <Link href="/merchant/diagnostics" className="hover:text-white transition-colors">Diagnóstico de feeds</Link>
            </>
          )}

          {role === 'admin' && (
            <>
              <Link href="/admin/dashboard" className="text-[#8367C7] hover:text-[#8367C7]/80 font-bold transition-colors inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Panel de admin</span>
              </Link>
              <Link href="/admin/currency" className="hover:text-white transition-colors">Tipos de cambio FX</Link>
              <Link href="/admin/queue" className="hover:text-white transition-colors">Cola metadatos BGG</Link>
              <button
                onClick={triggerSeed}
                disabled={isSeeding}
                className="text-[#73D8D4] hover:text-[#73D8D4]/80 font-bold underline ml-4 disabled:opacity-50 inline-flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{isSeeding ? 'Poblando...' : 'Poblar catálogo mock (22 juegos y portadas)'}</span>
              </button>
              {seedMsg && <span className="text-[#73D8D4] font-extrabold ml-2">{seedMsg}</span>}
            </>
          )}
        </div>

        {/* User Profile Quick Badge */}
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="truncate max-w-[150px]">
            Usuario activo: <strong className="text-gray-200">{role === 'admin' ? 'Super Admin' : role === 'partner' ? 'Socio Meeple' : 'Comprador LATAM'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
