'use client';

import React, { useState, useMemo } from 'react';

export interface ClickLogItem {
  created_at: string;
  bgg_id?: number | null;
  bgg_games_cache: { name: string } | null;
}

interface Props {
  clicks: ClickLogItem[];
  storeUrl?: string;
}

export function MerchantAnalyticsCharts({ clicks, storeUrl = 'https://tutienda.es' }: Props) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('7d');

  // Compute filtered clicks by timeframe
  const filteredClicks = useMemo(() => {
    if (timeframe === 'all') return clicks;
    const now = new Date().getTime();
    const days = timeframe === '7d' ? 7 : 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return clicks.filter((c) => new Date(c.created_at).getTime() >= cutoff);
  }, [clicks, timeframe]);

  // Aggregate daily clicks for chart
  const dailyAggregation = useMemo(() => {
    const counts: Record<string, number> = {};
    const daysToDisplay = timeframe === '30d' ? 14 : 7;
    const today = new Date();

    for (let i = daysToDisplay - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      counts[dateStr] = 0;
    }

    filteredClicks.forEach((c) => {
      const dateStr = new Date(c.created_at).toISOString().split('T')[0];
      if (dateStr in counts) {
        counts[dateStr] += 1;
      }
    });

    const maxCount = Math.max(...Object.values(counts), 1);
    return Object.entries(counts).map(([dateStr, count]) => {
      const parts = dateStr.split('-');
      const label = `${parts[2]}/${parts[1]}`;
      const percentage = Math.round((count / maxCount) * 100);
      return { dateStr, label, count, percentage };
    });
  }, [filteredClicks, timeframe]);

  // Top Referred Games
  const topGames = useMemo(() => {
    const gameCounts: Record<string, { count: number; name: string }> = {};
    filteredClicks.forEach((c) => {
      const name = c.bgg_games_cache?.name || 'Juego sin identificar';
      if (!gameCounts[name]) {
        gameCounts[name] = { count: 0, name };
      }
      gameCounts[name].count += 1;
    });

    const total = filteredClicks.length || 1;
    return Object.values(gameCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        share: Math.round((item.count / total) * 100),
      }));
  }, [filteredClicks]);

  return (
    <div className="flex flex-col gap-8">
      
      {/* Timeframe Filter & Trend Chart Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-950">Evolución Diaria de Clics Salientes</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Volumen de tráfico redireccionado de MeeplePrecios hacia tu tienda online.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                timeframe === '7d'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                timeframe === '30d'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Últimos 30 días
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                timeframe === 'all'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Histórico Total
            </button>
          </div>
        </div>

        {/* CSS Trend Bars */}
        <div className="flex items-end justify-between gap-2 h-44 pt-4 px-2">
          {dailyAggregation.map((bar) => (
            <div key={bar.dateStr} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[10px] font-extrabold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                {bar.count}
              </span>
              <div className="w-full max-w-[36px] bg-gray-100 rounded-t-lg h-32 flex items-end overflow-hidden">
                <div
                  style={{ height: `${bar.percentage}%` }}
                  className="w-full bg-indigo-600 rounded-t-lg transition-all duration-300 group-hover:bg-indigo-700"
                />
              </div>
              <span className="text-[10px] font-semibold text-gray-500 truncate max-w-full">
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Games Ranking */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-950">Top Juegos Generando Tráficos de Referencia</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Juegos de mesa más consultados y pulsados por los compradores hacia tu tienda en el periodo.
          </p>
        </div>

        {topGames.length === 0 ? (
          <div className="py-8 text-center text-xs font-semibold text-gray-400 bg-gray-50 rounded-xl border border-gray-150">
            Sin clics registrados en el periodo seleccionado.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-150">
            {topGames.map((game, idx) => (
              <div key={game.name} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-gray-900 truncate">{game.name}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden hidden sm:block">
                    <div style={{ width: `${game.share}%` }} className="bg-indigo-600 h-full rounded-full" />
                  </div>
                  <span className="text-xs font-extrabold text-gray-950 w-12 text-right">{game.count} clics</span>
                  <span className="text-[10px] font-semibold text-gray-500 w-10 text-right">({game.share}%)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UTM Tracking & Analytics Reconciliation Guide */}
      <div className="bg-indigo-950 text-white rounded-2xl p-6 shadow-md flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-800/80 flex items-center justify-center shrink-0 mt-0.5 text-indigo-300 font-bold">
            UTM
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-white">Guía de Conciliación y Seguimiento UTM</h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Todos los enlaces salientes redirigidos desde MeeplePrecios hacia tu tienda online incluyen automáticamente parámetros estándar UTM de Google Analytics 4, Shopify y WooCommerce para medir conversiones.
            </p>
          </div>
        </div>

        <div className="bg-indigo-900/90 rounded-xl p-4 border border-indigo-800/80 flex flex-col gap-2 font-mono text-xs text-indigo-100 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-indigo-300">Ejemplo de URL saliente con sufijo UTM inyectado:</span>
          <code>{storeUrl}/producto/catan?ref=meepleprecios&utm_source=meepleprecios&utm_medium=affiliate</code>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-indigo-900/50 p-3 rounded-xl border border-indigo-850">
            <span className="font-bold text-indigo-200 block text-[11px]">utm_source</span>
            <span className="text-white font-mono text-xs">meepleprecios</span>
          </div>
          <div className="bg-indigo-900/50 p-3 rounded-xl border border-indigo-850">
            <span className="font-bold text-indigo-200 block text-[11px]">utm_medium</span>
            <span className="text-white font-mono text-xs">affiliate</span>
          </div>
          <div className="bg-indigo-900/50 p-3 rounded-xl border border-indigo-850">
            <span className="font-bold text-indigo-200 block text-[11px]">ref (Shopify/Custom)</span>
            <span className="text-white font-mono text-xs">meepleprecios</span>
          </div>
        </div>
      </div>

    </div>
  );
}
