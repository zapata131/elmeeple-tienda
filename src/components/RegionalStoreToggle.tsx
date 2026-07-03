/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

interface RegionalStoreToggleProps {
  className?: string;
  onToggle?: (checked: boolean) => void;
  initialChecked?: boolean;
}

export function RegionalStoreToggle({ className = '', onToggle, initialChecked }: RegionalStoreToggleProps) {
  const router = useRouter();
  const [country, setCountry] = useState('ES');
  const [domesticOnly, setDomesticOnly] = useState(initialChecked ?? true);

  useEffect(() => {
    const savedCountry = getCookie('meeple_country');
    const savedDomestic = getCookie('meeple_domestic_only');
    if (savedCountry) setCountry(savedCountry);
    if (savedDomestic !== null) {
      setDomesticOnly(savedDomestic === 'true');
    }
  }, []);

  const handleToggle = (checked: boolean) => {
    setDomesticOnly(checked);
    document.cookie = `meeple_domestic_only=${checked}; path=/; max-age=31536000; SameSite=Lax`;
    if (onToggle) {
      onToggle(checked);
    } else {
      router.refresh();
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <label className="flex items-center gap-2.5 bg-gray-800/90 text-gray-200 px-3.5 py-2 rounded-xl border border-gray-700 shadow-xs cursor-pointer select-none hover:border-gray-600 transition-colors">
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            role="switch"
            aria-checked={domesticOnly}
            checked={domesticOnly}
            onChange={(e) => handleToggle(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 cursor-pointer"></div>
        </div>
        <span className="text-xs font-bold tracking-wide">
          Solo tiendas en mi país ({country})
        </span>
      </label>
    </div>
  );
}
