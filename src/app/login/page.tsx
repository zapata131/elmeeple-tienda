'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'player' | 'merchant' | 'admin'>('player');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'merchant') {
      router.push('/merchant/dashboard');
    } else if (role === 'admin') {
      router.push('/admin/queue');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-4xl">🔑</span>
        <h1 className="text-3xl font-extrabold text-[#3A3A3A]">Ingresar a MeeplePrecios</h1>
        <p className="text-xs text-gray-500">Selecciona tu rol para acceder al portal correspondiente.</p>
      </div>

      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="space-y-3">
          <label className="block text-xs font-bold text-[#3A3A3A]">Selecciona tu tipo de usuario:</label>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setRole('player')}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                role === 'player' ? 'border-[#8367C7] bg-[#8367C7]/10' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <h3 className="text-sm font-bold text-[#3A3A3A]">Jugador / Comprador</h3>
                <p className="text-[11px] text-gray-500">Busca ofertas y compara costos de envío en México</p>
              </div>
              {role === 'player' && <span className="text-[#8367C7] font-bold">✓</span>}
            </button>

            <button
              type="button"
              onClick={() => setRole('merchant')}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                role === 'merchant' ? 'border-[#8367C7] bg-[#8367C7]/10' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <h3 className="text-sm font-bold text-[#3A3A3A]">Socio / Tienda independiente</h3>
                <p className="text-[11px] text-gray-500">Administra tu feed, mapeo de SKUs y tarifas</p>
              </div>
              {role === 'merchant' && <span className="text-[#8367C7] font-bold">✓</span>}
            </button>

            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                role === 'admin' ? 'border-[#8367C7] bg-[#8367C7]/10' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <h3 className="text-sm font-bold text-[#3A3A3A]">Administrador de plataforma</h3>
                <p className="text-[11px] text-gray-500">Modera la cola de staging y verifica nuevas tiendas</p>
              </div>
              {role === 'admin' && <span className="text-[#8367C7] font-bold">✓</span>}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#8367C7] text-white text-sm font-bold shadow-md hover:bg-[#8367C7]/90 transition-all"
        >
          Ingresar al portal ➔
        </button>
      </form>
    </div>
  );
}
