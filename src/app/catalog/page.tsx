import React from 'react';
import { fetchCatalogGames } from '@/lib/queries';
import { CatalogView } from '@/components/CatalogView';
import { Toolbar } from '@/components/Toolbar';

interface SearchParams {
  q?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';

  const games = await fetchCatalogGames(query);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* Settings Toolbar */}
      <Toolbar />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Search Results</h1>
            {query && (
              <p className="text-sm text-gray-500 mt-1">
                Showing results for <span className="font-semibold text-indigo-600">&quot;{query}&quot;</span>
              </p>
            )}
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Interactive Catalog Component */}
      <main className="flex-1 py-6">
        <CatalogView initialGames={games} />
      </main>

    </div>
  );
}

// Inline Next.js 16 requirements
import Link from 'next/link';
