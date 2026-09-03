import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Users, Clock, Weight, Trophy, ArrowLeft, Layers } from 'lucide-react';
import { db } from '../../../lib/db/db';
import { PriceTable } from '../../../components/PriceTable';

export const revalidate = 60;

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await db.getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const offers = await db.getOffersForGame(game.id);

  // Check for spin-offs or parent game relationships (US-05)
  const allGames = await db.getCatalogGames();
  const relatedGames = allGames.filter(
    g => g.id !== game.id && (g.parent_game_id === game.id || (game.parent_game_id && g.id === game.parent_game_id))
  );

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-[#8367C7] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al catálogo</span>
        </Link>
      </div>

      {/* Hero Box Art Header & Typographic Metadata */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Box Art */}
          <div className="w-full md:w-64 h-64 md:h-64 rounded-2xl bg-stone-100 overflow-hidden flex-shrink-0 shadow-sm border border-stone-100 relative">
            {game.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={game.image_url}
                alt={game.title}
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover game-thumbnail"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🎲</div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200 uppercase tracking-wide">
                  {game.item_type === 'spinoff'
                    ? 'Variante spin-off'
                    : game.item_type === 'expansion'
                    ? 'Expansión'
                    : 'Juego base'}
                </span>
                {game.bgg_rank && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <Trophy className="w-3 h-3 text-amber-600" />
                    <span>Ranking BGG #{game.bgg_rank}</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#3A3A3A] tracking-tight">
                {game.title}
              </h1>
              {game.original_title && game.original_title !== game.title && (
                <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
                  Título original: {game.original_title}
                </p>
              )}
            </div>

            <p className="text-sm md:text-base text-stone-600 leading-relaxed max-w-3xl">
              {game.description ||
                'Compara precios y opciones de compra de este juego de mesa en tiendas independientes verificadas de México.'}
            </p>

            {/* Typographic Stats Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {game.min_players && game.max_players && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs font-medium text-stone-700">
                  <Users className="w-4 h-4 text-[#8367C7]" />
                  <span>
                    {game.min_players === game.max_players
                      ? `${game.min_players} jugadores`
                      : `${game.min_players}-${game.max_players} jugadores`}
                  </span>
                </div>
              )}

              {game.playing_time && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs font-medium text-stone-700">
                  <Clock className="w-4 h-4 text-[#8367C7]" />
                  <span>{game.playing_time} minutos</span>
                </div>
              )}

              {game.weight && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs font-medium text-stone-700">
                  <Weight className="w-4 h-4 text-[#8367C7]" />
                  <span>Complejidad: {game.weight.toFixed(2)} / 5.0</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spin-off or Parent Game Notice (US-05) */}
      {relatedGames.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#8367C7]/5 border border-[#8367C7]/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-[#8367C7]" />
            <div>
              <p className="text-xs font-semibold text-[#8367C7]">Juegos y variantes relacionadas</p>
              <p className="text-xs text-stone-600">
                {game.item_type === 'spinoff'
                  ? 'Esta es una variante spin-off independiente. También puedes comparar el juego base.'
                  : 'Este juego tiene variantes spin-off o expansiones disponibles en tiendas.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {relatedGames.map(rel => (
              <Link
                key={rel.id}
                href={`/game/${rel.slug}`}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8367C7] bg-white border border-[#8367C7]/30 hover:bg-[#8367C7] hover:text-white transition-colors"
              >
                Ver {rel.title} →
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 3-Part Comparative Price Table */}
      <section className="space-y-4">
        <PriceTable offers={offers} />
      </section>
    </div>
  );
}
