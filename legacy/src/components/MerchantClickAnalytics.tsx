'use client';

import React, { useState, useMemo } from 'react';

export interface ClickRecord {
  id: string;
  created_at: string;
  bgg_id: number;
  bgg_games_cache?: {
    name?: string;
  } | null;
  store_id?: string;
}

export interface MerchantClickAnalyticsProps {
  clicks: ClickRecord[];
  storeName?: string;
  defaultCpcRate?: number;
}

export function MerchantClickAnalytics({ clicks, storeName = 'Tu Tienda', defaultCpcRate = 3.00 }: MerchantClickAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoice'>('overview');
  const [cpcRate, setCpcRate] = useState<number>(defaultCpcRate);

  // Available billing months (formatted as YYYY-MM)
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    const now = new Date();
    const currentFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    months.add(currentFormatted);

    clicks.forEach((c) => {
      if (c.created_at) {
        const d = new Date(c.created_at);
        if (!isNaN(d.getTime())) {
          months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
      }
    });

    return Array.from(months).sort().reverse();
  }, [clicks]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || '2026-07');

  // Filter clicks by selected month
  const monthClicks = useMemo(() => {
    return clicks.filter((c) => {
      if (!c.created_at) return false;
      const d = new Date(c.created_at);
      if (isNaN(d.getTime())) return false;
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return formatted === selectedMonth;
    });
  }, [clicks, selectedMonth]);

  // Aggregate top performing games (all time)
  const topGamesAllTime = useMemo(() => {
    const gameMap = new Map<string, { bgg_id: number; name: string; count: number }>();
    clicks.forEach((c) => {
      const name = c.bgg_games_cache?.name || `Juego #${c.bgg_id}`;
      const key = `${c.bgg_id}_${name}`;
      const existing = gameMap.get(key) || { bgg_id: c.bgg_id, name, count: 0 };
      existing.count += 1;
      gameMap.set(key, existing);
    });

    return Array.from(gameMap.values()).sort((a, b) => b.count - a.count);
  }, [clicks]);

  // Aggregate month breakdown per game
  const monthGamesBreakdown = useMemo(() => {
    const gameMap = new Map<string, { bgg_id: number; name: string; count: number; dateRange: string }>();
    monthClicks.forEach((c) => {
      const name = c.bgg_games_cache?.name || `Juego #${c.bgg_id}`;
      const key = `${c.bgg_id}_${name}`;
      const existing = gameMap.get(key) || { bgg_id: c.bgg_id, name, count: 0, dateRange: selectedMonth };
      existing.count += 1;
      gameMap.set(key, existing);
    });

    return Array.from(gameMap.values()).sort((a, b) => b.count - a.count);
  }, [monthClicks, selectedMonth]);

  const totalClicksCount = clicks.length;
  const monthClicksCount = monthClicks.length;
  const monthTotalAmount = (monthClicksCount * (cpcRate || 0)).toFixed(2);

  const handleDownloadCsv = () => {
    const headers = 'ID Clic,Fecha y Hora (UTC),ID Juego BGG,Nombre del Juego,Tarifa CPC (MXN),Subtotal (MXN)\n';
    const rows = monthClicks.map((c) => {
      const name = (c.bgg_games_cache?.name || `Juego #${c.bgg_id}`).replace(/,/g, ' ');
      const dateStr = new Date(c.created_at).toISOString();
      return `"${c.id}","${dateStr}","${c.bgg_id}","${name}","${cpcRate.toFixed(2)}","${cpcRate.toFixed(2)}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `facturacion_cpc_${storeName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col gap-6 p-6 md:p-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-950">Analítica de clics salientes y facturación cpc</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitoree el tráfico de referencia redireccionado a su tienda y genere resúmenes de facturación mensual CPC/CPA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Rendimiento por juego
          </button>
          <button
            onClick={() => setActiveTab('invoice')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'invoice'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Facturación y resumen cpc
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Clics de referencia acumulados</span>
          <span className="text-3xl font-extrabold text-gray-950 mt-1">{totalClicksCount}</span>
          <span className="text-[10px] text-gray-500 mt-1">Tráfico total redireccionado</span>
        </div>

        <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-5 flex flex-col">
          <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider">Clics en el período ({selectedMonth})</span>
          <span className="text-3xl font-extrabold text-indigo-950 mt-1">{monthClicksCount}</span>
          <span className="text-[10px] text-indigo-700 mt-1">Tráfico facturable del mes</span>
        </div>

        <div className="bg-green-50/70 border border-green-200 rounded-xl p-5 flex flex-col">
          <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Importe mensual de facturación</span>
          <span className="text-3xl font-extrabold text-green-950 mt-1">${monthTotalAmount} MXN</span>
          <span className="text-[10px] text-green-700 mt-1">Calculado a ${cpcRate.toFixed(2)} MXN / clic</span>
        </div>
      </div>

      {/* Tab 1: Overview & Top Games */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-4 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-950">Top juegos en referencia de tráfico</h3>
            <span className="text-xs text-gray-500 font-medium">Ordenado por clics acumulados</span>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs text-gray-700 border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3">Posición</th>
                  <th className="px-5 py-3">Juego de mesa</th>
                  <th className="px-5 py-3">ID BGG</th>
                  <th className="px-5 py-3">Clics salientes</th>
                  <th className="px-5 py-3">Cuota de tráfico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topGamesAllTime.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400 font-medium">
                      No se han registrado clics de referencia para su tienda todavía.
                    </td>
                  </tr>
                ) : (
                  topGamesAllTime.map((game, idx) => {
                    const share = totalClicksCount > 0 ? ((game.count / totalClicksCount) * 100).toFixed(1) : '0';
                    return (
                      <tr key={`${game.bgg_id}-${idx}`} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-bold text-gray-400">#{idx + 1}</td>
                        <td className="px-5 py-4 font-bold text-gray-900">{game.name}</td>
                        <td className="px-5 py-4 font-mono text-gray-500">#{game.bgg_id}</td>
                        <td className="px-5 py-4 font-bold text-indigo-700">{game.count} clics</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${share}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-500 font-semibold">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Monthly CPC Billing Summary Generator */}
      {activeTab === 'invoice' && (
        <div className="flex flex-col gap-6 border-t border-gray-200 pt-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 border border-gray-200 p-5 rounded-xl">
            <div className="flex flex-wrap items-center gap-6">
              
              <div className="flex flex-col gap-1">
                <label htmlFor="select-period" className="text-xs font-bold text-gray-700">
                  Período de facturación
                </label>
                <select
                  id="select-period"
                  aria-label="Período de facturación"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="input-cpc-rate" className="text-xs font-bold text-gray-700">
                  Tarifa por clic (cpc)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 font-bold">$</span>
                  <input
                    id="input-cpc-rate"
                    aria-label="Tarifa por clic (cpc)"
                    type="number"
                    step="0.05"
                    min="0"
                    value={cpcRate}
                    onChange={(e) => setCpcRate(parseFloat(e.target.value) || 0)}
                    className="w-24 text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-gray-500 font-semibold">MXN</span>
                </div>
              </div>

            </div>

            <button
              onClick={handleDownloadCsv}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow-sm flex items-center gap-2 self-start md:self-auto"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Descargar desglose csv</span>
            </button>
          </div>

          {/* Invoice Summary Card */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-950">Resumen de facturación mensual (cpc)</h3>
                <span className="text-xs text-gray-500">Tienda: {storeName} · Período: {selectedMonth}</span>
              </div>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 font-bold px-3 py-1 rounded-full text-xs">
                Factura proforma del período
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Clics totales registrados</span>
                <span className="text-xl font-bold text-gray-900 mt-1">{monthClicksCount} clics</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Tarifa unitaria cpc</span>
                <span className="text-xl font-bold text-gray-900 mt-1">${cpcRate.toFixed(2)} MXN</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Total a facturar</span>
                <span className="text-2xl font-extrabold text-indigo-700 mt-1">${monthTotalAmount} MXN</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Desglose de clics por juego de mesa</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs text-gray-700 border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                      <th className="px-4 py-2.5">Juego de mesa</th>
                      <th className="px-4 py-2.5">ID BGG</th>
                      <th className="px-4 py-2.5">Clics en el período</th>
                      <th className="px-4 py-2.5">Tarifa CPC</th>
                      <th className="px-4 py-2.5">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthGamesBreakdown.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                          No hay clics registrados en el período seleccionado.
                        </td>
                      </tr>
                    ) : (
                      monthGamesBreakdown.map((g, idx) => {
                        const subtotal = (g.count * cpcRate).toFixed(2);
                        return (
                          <tr key={`${g.bgg_id}-${idx}`} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-bold text-gray-900">{g.name}</td>
                            <td className="px-4 py-3 font-mono text-gray-500">#{g.bgg_id}</td>
                            <td className="px-4 py-3 font-bold text-indigo-700">{g.count}</td>
                            <td className="px-4 py-3 font-medium text-gray-600">${cpcRate.toFixed(2)} MXN</td>
                            <td className="px-4 py-3 font-bold text-gray-900">${subtotal} MXN</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
