/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

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
  const [role, setRole] = useState('player');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  useEffect(() => {
    document.cookie = 'meeple_country=MX; path=/; max-age=31536000; SameSite=Lax';
    document.cookie = 'meeple_currency=MXN; path=/; max-age=31536000; SameSite=Lax';
    const savedRole = getCookie('meeple_role');
    if (savedRole) setRole(savedRole);
  }, []);

  const triggerSeed = async () => {
    setIsSeeding(true);
    setSeedMsg('');
    try {
      const res = await fetch('/api/admin/seed-data', { method: 'POST' });
      if (res.ok) {
        setSeedMsg('¡Catálogo mock cargado!');
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
              <span>MeeplePrecios 🇲🇽</span>
            </Link>
          )}

          {/* Role Switcher Pill Bar */}
          <div className="flex items-center bg-gray-800/80 rounded-lg p-1 border border-gray-700">
            <span className="text-[10px] uppercase font-bold text-gray-400 px-2">Perfil mock:</span>
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

        {/* Active Mock User Identity Badge */}
        <div className="flex items-center gap-2 text-xs text-gray-400 ml-auto">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>
            Usuario: <strong className="text-gray-200">{role === 'admin' ? 'Super Admin (admin@meeple.mx)' : role === 'partner' ? 'Socio Tienda (carlos@elduende.mx)' : 'Compradora (sofia@meeple.mx)'}</strong>
          </span>
        </div>
      </div>

      {/* Role-Specific Secondary Navigation Row */}
      <div className="bg-gray-950 px-6 py-2 border-t border-gray-800/80 flex items-center justify-between text-xs font-semibold text-gray-400">
        <div className="flex items-center gap-6">
          <span className="text-gray-500 uppercase font-mono text-[10px] tracking-wider">
            Navegación ({role.toUpperCase()}):
          </span>

          {role === 'player' && (
            <>
              <Link href="/catalog" className="hover:text-white transition-colors">Catálogo completo</Link>
              <Link href="/player/dashboard" className="hover:text-white transition-colors text-indigo-400 font-bold">Mi perfil</Link>
            </>
          )}

          {role === 'partner' && (
            <>
              <Link href="/merchant/dashboard" className="text-[#73D8D4] hover:text-[#73D8D4]/80 font-bold transition-colors inline-flex items-center gap-1">
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
                <span>Panel de admin</span>
              </Link>
              <Link href="/admin/queue" className="hover:text-white transition-colors">Cola metadatos BGG</Link>
              <button
                onClick={triggerSeed}
                disabled={isSeeding}
                className="text-[#73D8D4] hover:text-[#73D8D4]/80 font-bold underline ml-4 disabled:opacity-50 inline-flex items-center gap-1"
              >
                <span>{isSeeding ? 'Poblando...' : 'Poblar catálogo mock (22 juegos y portadas)'}</span>
              </button>
              {seedMsg && <span className="text-[#73D8D4] font-extrabold ml-2">{seedMsg}</span>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
