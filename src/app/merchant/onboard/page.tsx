import React from 'react';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { Toolbar } from '@/components/Toolbar';
import Link from 'next/link';

export default function MerchantOnboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* Global Settings Toolbar */}
      <Toolbar />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold text-gray-900 flex items-center gap-2 select-none">
            <span>🎲</span> Meeple<span className="text-indigo-500">Precios</span>
          </Link>
          <span className="text-sm font-semibold text-gray-500">Portal de Socios</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 py-12 px-4 flex items-center justify-center">
        <OnboardingWizard />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t border-gray-800 py-8 px-6 text-center text-xs text-gray-500">
        <p>© 2026 MeeplePrecios. Todos los derechos reservados. El Meeple España & LATAM.</p>
      </footer>

    </div>
  );
}
