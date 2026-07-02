/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';

interface PricePoint {
  min_price: number;
  recorded_at: string;
}

interface Props {
  bggId: number;
}

export function PriceChart({ bggId }: Props) {
  const [days, setDays] = useState(30);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    async function loadHistory() {
      try {
        const res = await fetch(`/api/price-history?bgg_id=${bggId}&days=${days}`);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setHistory(data);
          }
        }
      } catch (err) {
        console.error('Error fetching price history:', err);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadHistory();
    return () => {
      active = false;
    };
  }, [bggId, days]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center h-64 text-sm text-gray-500 font-medium">
        Loading price history...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 items-center justify-center h-64 text-sm text-gray-500 font-medium">
        <span>No price history available</span>
        <div className="flex gap-2">
          <button onClick={() => setDays(30)} className={`px-3 py-1 rounded border text-xs font-semibold ${days === 30 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-gray-700'}`}>30 días</button>
          <button onClick={() => setDays(90)} className={`px-3 py-1 rounded border text-xs font-semibold ${days === 90 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-gray-700'}`}>90 días</button>
          <button onClick={() => setDays(365)} className={`px-3 py-1 rounded border text-xs font-semibold ${days === 365 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-gray-700'}`}>1 año</button>
        </div>
      </div>
    );
  }

  // Calculate scales
  const prices = history.map((pt) => pt.min_price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice || 10;

  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;

  const getX = (index: number) => {
    if (history.length <= 1) return width / 2;
    return paddingX + (index * (width - 2 * paddingX)) / (history.length - 1);
  };

  const getY = (price: number) => {
    return height - paddingY - ((price - minPrice) / priceRange) * (height - 2 * paddingY);
  };

  // Build path d string
  const points = history.map((pt, idx) => ({
    x: getX(idx),
    y: getY(pt.min_price),
    price: pt.min_price,
    date: pt.recorded_at,
  }));

  const d = points.reduce((acc, pt, idx) => {
    return acc + (idx === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
  }, '');

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-base">Evolución de Precio Mínimo</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setDays(30)}
            className={`px-3 py-1 rounded border text-xs font-semibold transition-colors ${
              days === 30 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            30 días
          </button>
          <button
            onClick={() => setDays(90)}
            className={`px-3 py-1 rounded border text-xs font-semibold transition-colors ${
              days === 90 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            90 días
          </button>
          <button
            onClick={() => setDays(365)}
            className={`px-3 py-1 rounded border text-xs font-semibold transition-colors ${
              days === 365 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            1 año
          </button>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          data-testid="price-chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#f3f4f6" strokeWidth={1} />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#e5e7eb" strokeWidth={1} />

          {/* Line Path */}
          {d && (
            <path
              data-testid="price-chart-path"
              d={d}
              fill="none"
              stroke="#6366f1"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Dots and Labels */}
          {points.map((pt, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle cx={pt.x} cy={pt.y} r={5} fill="#6366f1" stroke="#ffffff" strokeWidth={2} />
              <text
                x={pt.x}
                y={pt.y - 10}
                textAnchor="middle"
                className="text-[10px] font-bold fill-indigo-600"
              >
                €{pt.price.toFixed(2)}
              </text>
              <text
                x={pt.x}
                y={height - 10}
                textAnchor="middle"
                className="text-[8px] fill-gray-400 font-medium"
              >
                {pt.date.split('-').slice(1).join('/')}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
