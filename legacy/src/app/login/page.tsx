'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Toolbar } from '@/components/Toolbar';

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    setIsLoading(false);

    if (res?.error) {
      setErrorMsg('Credenciales incorrectas. Intenta con alguna de las cuentas demo de abajo.');
    } else {
      if (email.toLowerCase().startsWith('admin')) {
        router.push('/admin/dashboard');
      } else if (email.toLowerCase().startsWith('merchant') || email.toLowerCase().startsWith('partner')) {
        router.push('/merchant/dashboard');
      } else {
        router.push(callbackUrl);
      }
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col gap-6">
      <div className="text-center">
        <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">Portal de acceso</span>
        <h1 className="text-2xl font-extrabold text-gray-950 mt-1">Iniciar sesión en MeeplePrecios</h1>
        <p className="text-xs text-gray-500 mt-1">Accede como jugador, tienda asociada o administrador general.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Correo electrónico</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@meepleprecios.com"
            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            'Entrar a la plataforma →'
          )}
        </button>
      </form>

      <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
        <span className="text-xs font-bold text-gray-700 text-center">💡 Cuentas demo para pruebas rápidas</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillDemo('admin@meepleprecios.com')}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-xl text-xs font-bold text-center transition-colors"
          >
            🛡️ Admin Demo
          </button>
          <button
            type="button"
            onClick={() => fillDemo('merchant@meepleprecios.com')}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold text-center transition-colors"
          >
            🏪 Tienda Demo
          </button>
          <button
            type="button"
            onClick={() => fillDemo('jugador@meepleprecios.com')}
            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-2 rounded-xl text-xs font-bold text-center transition-colors"
          >
            🎲 Jugador Demo
          </button>
        </div>
        <p className="text-[11px] text-gray-400 text-center mt-1">
          Al pulsar cualquier botón demo se autocompleta el correo y la clave (<code className="font-mono">admin123</code>).
        </p>
      </div>

      <div className="text-center pt-2">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 font-semibold">
          ← Regresar a la página principal
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 select-none">
      <Toolbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={<div className="text-xs font-bold text-gray-500">Cargando portal de acceso...</div>}>
          <LoginFormContent />
        </Suspense>
      </main>
    </div>
  );
}
