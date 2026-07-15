import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db/mock-db';
import { PriceComparisonTable } from '@/components/PriceComparisonTable';
import Link from 'next/link';

interface GameDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = await params;
  const bggId = parseInt(id, 10);

  if (isNaN(bggId)) {
    notFound();
  }

  const game = db.getBggGameById(bggId);

  if (!game) {
    notFound();
  }

  const offers = db.getOffersForGame(bggId);

  return (
    <div className="space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:underline">Inicio</Link>
        <span>/</span>
        <Link href="/search" className="hover:underline">Catálogo</Link>
        <span>/</span>
        <span className="text-[#3A3A3A] font-semibold">{game.name}</span>
      </nav>

      {/* Hero Section with Box Art & Stats (US-02) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Full-Width Box Art Header / Gallery */}
        <div className="md:col-span-1 aspect-square bg-[#F5F0E9] rounded-2xl overflow-hidden border border-gray-200">
          <img
            src={game.image || game.thumbnail || 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&h=800&fit=crop'}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Typographic Stats & Description */}
        <div className="md:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3A3A3A]">
                {game.name}
              </h1>
              {game.item_type === 'expansion' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#3A3A3A] text-white">
                  Expansión
                </span>
              )}
              {game.item_type === 'boardgame' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8367C7]/20 text-[#8367C7]">
                  Juego base independiente
                </span>
              )}
            </div>

            {game.alternate_names && game.alternate_names.length > 0 && (
              <p className="text-xs text-gray-400">
                Títulos alternativos: {game.alternate_names.join(', ')}
              </p>
            )}

            <p className="text-sm text-gray-600 leading-relaxed">
              {game.description || 'Sin descripción disponible para este título.'}
            </p>
          </div>

          {/* Key Stats Pill Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
            <div className="p-3 rounded-xl bg-[#F5F0E9]/60 border border-gray-200">
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Jugadores</span>
              <span className="text-sm font-bold text-[#3A3A3A]">👥 {game.min_players}-{game.max_players}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F0E9]/60 border border-gray-200">
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Duración</span>
              <span className="text-sm font-bold text-[#3A3A3A]">⏱️ {game.playing_time} min</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F0E9]/60 border border-gray-200">
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Complejidad (BGG)</span>
              <span className="text-sm font-bold text-[#3A3A3A]">⚖️ {game.weight ? `${game.weight.toFixed(2)} / 5` : 'N/A'}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F0E9]/60 border border-gray-200">
              <span className="text-[10px] text-gray-400 font-semibold block uppercase">Código EAN/GTIN</span>
              <span className="text-xs font-mono font-bold text-[#3A3A3A]">{game.ean || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Part Price Comparison Table (US-02, US-03) */}
      <section className="space-y-4">
        <PriceComparisonTable bggId={game.bgg_id} offers={offers} />
      </section>
    </div>
  );
}
