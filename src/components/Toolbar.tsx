/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const countries = [
  { code: 'ES', name: 'España' },
  { code: 'PT', name: 'Portugal' },
  { code: 'MX', name: 'México' },
  { code: 'BR', name: 'Brasil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Perú' },
];

const currencies = [
  { code: 'EUR', symbol: '€' },
  { code: 'BRL', symbol: 'R$' },
  { code: 'MXN', symbol: '$' },
  { code: 'ARS', symbol: '$' },
  { code: 'COP', symbol: '$' },
  { code: 'CLP', symbol: '$' },
  { code: 'PEN', symbol: 'S/.' },
  { code: 'USD', symbol: '$' },
];

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
  const [country, setCountry] = useState('ES');
  const [currency, setCurrency] = useState('EUR');
  const [language, setLanguage] = useState('es'); // Default Spanish
  const [role, setRole] = useState('player');
  const [domesticOnly, setDomesticOnly] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  useEffect(() => {
    const savedCountry = getCookie('meeple_country');
    const savedCurrency = getCookie('meeple_currency');
    const savedLang = getCookie('meeple_language');
    const savedRole = getCookie('meeple_role');
    const savedDomestic = getCookie('meeple_domestic_only');

    if (savedCountry) setCountry(savedCountry);
    if (savedCurrency) setCurrency(savedCurrency);
    if (savedLang) setLanguage(savedLang);
    if (savedRole) setRole(savedRole);
    if (savedDomestic === 'true') setDomesticOnly(true);
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCountry(val);
    document.cookie = `meeple_country=${val}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCurrency(val);
    document.cookie = `meeple_currency=${val}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLanguage(val);
    document.cookie = `meeple_language=${val}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  const toggleDomestic = (checked: boolean) => {
    setDomesticOnly(checked);
    document.cookie = `meeple_domestic_only=${checked}; path=/; max-age=31536000; SameSite=Lax`;
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
          
          {/* Domestic Only Checkbox */}
          <label className="flex items-center gap-2 text-xs font-medium text-gray-300 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-600">
            <input
              type="checkbox"
              checked={domesticOnly}
              onChange={(e) => toggleDomestic(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5 bg-gray-900 border-gray-600"
            />
            <span>Solo Tiendas Nacionales ({country})</span>
          </label>

          {/* Country Selector */}
          <div className="flex items-center gap-1.5">
            <select
              aria-label="país de envío"
              value={country}
              onChange={handleCountryChange}
              className="bg-gray-800 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-1.5">
            <select
              aria-label="moneda"
              value={currency}
              onChange={handleCurrencyChange}
              className="bg-gray-800 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
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
                  🌐 {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Multi-Game Optimizer Button (Clean SVG Vector Icon, No Emoji) */}
          <Link
            href="/optimizer"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Comparador Multi-Juego</span>
          </Link>
        </div>
      </div>

      {/* Role-Specific Secondary Navigation Row */}
      <div className="bg-gray-950 px-6 py-2 border-t border-gray-800/80 flex items-center justify-between text-xs font-semibold text-gray-400">
        <div className="flex items-center gap-6">
          <span className="text-gray-500 uppercase font-mono text-[10px] tracking-wider">
            Navegación por Rol ({role.toUpperCase()}):
          </span>

          {role === 'player' && (
            <>
              <Link href="/catalog" className="hover:text-white transition-colors">Catálogo Completo</Link>
              <Link href="/optimizer" className="hover:text-white transition-colors">Lista de Deseos & Envíos</Link>
            </>
          )}

          {role === 'partner' && (
            <>
              <Link href="/merchant/dashboard" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">🏪 Panel Tienda</Link>
              <Link href="/merchant/onboard" className="hover:text-white transition-colors">Dar de Alta Tienda</Link>
              <Link href="/merchant/shipping" className="hover:text-white transition-colors">Tarifas de Envío</Link>
              <Link href="/merchant/diagnostics" className="hover:text-white transition-colors">Diagnóstico de Feeds</Link>
            </>
          )}

          {role === 'admin' && (
            <>
              <Link href="/admin/dashboard" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">🛡️ Panel Administración</Link>
              <Link href="/admin/currency" className="hover:text-white transition-colors">Tipos de Cambio FX</Link>
              <Link href="/admin/queue" className="hover:text-white transition-colors">Cola Metadatos BGG</Link>
              <button
                onClick={triggerSeed}
                disabled={isSeeding}
                className="text-emerald-400 hover:text-emerald-300 font-bold underline ml-4 disabled:opacity-50"
              >
                {isSeeding ? 'Poblando...' : '🌱 Poblar Catálogo Mock (22 Juegos & Portadas)'}
              </button>
              {seedMsg && <span className="text-emerald-300 font-extrabold ml-2">{seedMsg}</span>}
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
