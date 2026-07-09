'use client';

import React, { useState } from 'react';

export interface PriceHistoryPoint {
  recorded_at: string;
  min_price: number;
}

interface PriceHistoryChartProps {
  bggId: number;
  gameName: string;
  history: PriceHistoryPoint[];
  currentMinPrice?: number | null;
}

export default function PriceHistoryChart({
  history,
  currentMinPrice,
}: PriceHistoryChartProps) {
  const [selectedRange, setSelectedRange] = useState<'30' | '90' | '365'>('90');

  if (!history || history.length === 0) {
    return (
      <div
        data-testid="price-history-empty"
        className="bg-white rounded-xl border border-gray-200 p-6 text-center text-xs text-gray-500 font-medium"
      >
        Sin suficiente historial de precios registrado aún.
      </div>
    );
  }

  // Filter history based on selectedRange
  const daysLimit = parseInt(selectedRange, 10);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysLimit);

  const filteredHistory = history.filter((pt) => new Date(pt.recorded_at) >= cutoffDate);
  const points = filteredHistory.length > 0 ? filteredHistory : history;

  const prices = points.map((p) => p.min_price);
  const minPriceRecorded = Math.min(...prices);
  const maxPriceRecorded = Math.max(...prices);

  const initialPrice = points[0]?.min_price || minPriceRecorded;
  const latestPrice = currentMinPrice ?? points[points.length - 1]?.min_price ?? minPriceRecorded;
  const priceDiff = latestPrice - initialPrice;
  const percentChange = initialPrice > 0 ? (priceDiff / initialPrice) * 100 : 0;

  // SVG Geometry Calculation
  const width = 600;
  const height = 160;
  const padding = 20;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const priceRange = maxPriceRecorded === minPriceRecorded ? 1 : maxPriceRecorded - minPriceRecorded;

  const svgPoints = points.map((pt, idx) => {
    const x = padding + (idx / (points.length - 1 || 1)) * chartWidth;
    const y = height - padding - ((pt.min_price - minPriceRecorded) / priceRange) * chartHeight;
    return { x, y, price: pt.min_price, date: pt.recorded_at };
  });

  const polylineStr = svgPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = `M ${svgPoints[0].x},${height - padding} L ${polylineStr} L ${svgPoints[svgPoints.length - 1].x},${height - padding} Z`;

  return (
    <div
      data-testid="price-history-chart"
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-150 pb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <span>Historial de precios (Últimos 90 días)</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            Tendencia de precios mínimos verificados en tiendas mexicanas
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
          {(['30', '90', '365'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                selectedRange === range
                  ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range === '365' ? '1 año' : `${range} días`}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Mínimo en período</span>
          <span
            data-testid="lowest-price-recorded"
            className="text-sm font-extrabold text-teal-900"
          >
            ${minPriceRecorded.toFixed(2)} MXN
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Máximo en período</span>
          <span className="text-sm font-extrabold text-gray-800">
            ${maxPriceRecorded.toFixed(2)} MXN
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Variación de precio</span>
          <span
            className={`text-sm font-extrabold ${
              priceDiff <= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {priceDiff <= 0 ? '' : '+'}{percentChange.toFixed(1)}% ({priceDiff <= 0 ? '-' : '+'}${Math.abs(priceDiff).toFixed(2)})
          </span>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          data-testid="price-history-svg"
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-40 overflow-visible"
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8367C7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8367C7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill="url(#priceGradient)" />

          {/* Line */}
          <polyline
            fill="none"
            stroke="#8367C7"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylineStr}
          />

          {/* Data points */}
          {svgPoints.map((pt, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="#8367C7"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="group-hover:r-6 transition-all"
              />
              <title>{`${pt.date}: $${pt.price.toFixed(2)} MXN`}</title>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
