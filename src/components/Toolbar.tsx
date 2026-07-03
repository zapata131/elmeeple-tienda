/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function Toolbar() {
  const router = useRouter();
  const [country, setCountry] = useState('ES');
  const [currency, setCurrency] = useState('EUR');

  useEffect(() => {
    const savedCountry = getCookie('meeple_country');
    const savedCurrency = getCookie('meeple_currency');
    if (savedCountry) setCountry(savedCountry);
    if (savedCurrency) setCurrency(savedCurrency);
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

  return (
    <div className="flex flex-wrap items-center gap-4 bg-gray-900 px-6 py-3 border-b border-gray-800 text-white select-none">
      <div className="flex items-center gap-2">
        <label htmlFor="country-select" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Shipping Country
        </label>
        <select
          id="country-select"
          aria-label="shipping country"
          value={country}
          onChange={handleCountryChange}
          className="bg-gray-800 text-white text-sm font-medium rounded-lg px-3 py-1.5 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="currency-select" className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Currency
        </label>
        <select
          id="currency-select"
          aria-label="currency"
          value={currency}
          onChange={handleCurrencyChange}
          className="bg-gray-800 text-white text-sm font-medium rounded-lg px-3 py-1.5 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          {currencies.map((curr) => (
            <option key={curr.code} value={curr.code}>
              {curr.code} ({curr.symbol})
            </option>
          ))}
        </select>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/optimizer"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
        >
          <span>✨ Comparador Multi-Juego</span>
        </Link>
      </div>
    </div>
  );
}
