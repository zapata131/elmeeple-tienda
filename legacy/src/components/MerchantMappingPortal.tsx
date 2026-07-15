'use client';

import React, { useState } from 'react';

export interface UnmatchedFeedItem {
  id: string;
  store_id: string;
  ean: string | null;
  title: string;
  store_product_url: string;
  status: string;
  created_at: string;
}

interface Props {
  storeId: string;
  initialItems: UnmatchedFeedItem[];
}

export function MerchantMappingPortal({ storeId, initialItems }: Props) {
  const [items, setItems] = useState<UnmatchedFeedItem[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<UnmatchedFeedItem | null>(null);
  const [bggSearchInput, setBggSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ bgg_id: number; name: string }>>([]);
  const [selectedBggId, setSelectedBggId] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchBgg = async () => {
    if (!bggSearchInput.trim()) return;
    setIsSearching(true);
    setErrorMsg('');

    try {
      const numericId = parseInt(bggSearchInput.trim(), 10);
      if (!isNaN(numericId)) {
        setSearchResults([{ bgg_id: numericId, name: `Juego BGG #${numericId}` }]);
        setSelectedBggId(numericId);
        setIsSearching(false);
        return;
      }

      const res = await fetch(`/api/search?q=${encodeURIComponent(bggSearchInput.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.games || []);
        if (data.games?.length > 0) {
          setSelectedBggId(data.games[0].bgg_id);
        }
      }
    } catch {
      setErrorMsg('Error al buscar en el catálogo BGG.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBindGame = async (item: UnmatchedFeedItem) => {
    const targetBggId = selectedBggId || parseInt(bggSearchInput.trim(), 10);
    if (!targetBggId || isNaN(targetBggId)) {
      setErrorMsg('Selecciona o escribe un BGG ID válido.');
      return;
    }

    setLoadingId(item.id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/merchant/mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          queueId: item.id,
          merchantSku: item.ean || item.store_product_url,
          bggId: targetBggId,
          storeProductUrl: item.store_product_url,
        }),
      });

      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setSuccessMsg('Producto vinculado y guardado en la memoria permanente de tu tienda.');
        setSelectedItem(null);
        setBggSearchInput('');
        setSelectedBggId(null);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Error al vincular el producto.');
      }
    } catch {
      setErrorMsg('Error de red al conectar con el servidor.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col gap-6 font-sans">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-950">Portal de mapeo de productos no catalogados</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Vincula productos de tu feed que no fueron automapeados para incluirlos en las comparativas de MeeplePrecios.
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl">
          Pendientes: {items.length}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
          <span>{successMsg}</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8 text-xs text-gray-400">
          ¡Excelente! Todos los productos de tu feed están catalogados y mapeados.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => {
            const isSelected = selectedItem?.id === item.id;

            return (
              <div
                key={item.id}
                className={`border rounded-xl p-4 transition-all ${
                  isSelected ? 'border-[#8367C7] bg-[#8367C7]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-gray-950">{item.title}</span>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                      <span>EAN / SKU: {item.ean || 'N/A'}</span>
                      <span>•</span>
                      <a
                        href={item.store_product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8367C7] hover:underline truncate max-w-xs inline-block"
                      >
                        Ver enlace del producto
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (isSelected) {
                        setSelectedItem(null);
                      } else {
                        setSelectedItem(item);
                        setBggSearchInput(item.title);
                      }
                    }}
                    className="text-xs bg-white hover:bg-gray-100 text-gray-800 font-bold px-3 py-1.5 rounded-lg border border-gray-300 transition-colors shadow-sm self-start md:self-auto"
                  >
                    {isSelected ? 'Cerrar mapeo' : 'Mapear producto'}
                  </button>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-3">
                    <span className="text-xs font-bold text-gray-800">Vinculación con catálogo BGG:</span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Buscar juego en el catálogo BGG (Nombre o BGG ID)..."
                        value={bggSearchInput}
                        onChange={(e) => setBggSearchInput(e.target.value)}
                        className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8367C7]"
                      />
                      <button
                        onClick={handleSearchBgg}
                        disabled={isSearching}
                        className="text-xs bg-gray-900 hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                      >
                        {isSearching ? 'Buscando...' : 'Buscar BGG'}
                      </button>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-1">
                        <span className="text-[11px] font-bold text-gray-600">Resultados encontrados:</span>
                        <div className="flex flex-wrap gap-2">
                          {searchResults.map((game) => (
                            <button
                              key={game.bgg_id}
                              onClick={() => setSelectedBggId(game.bgg_id)}
                              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                                selectedBggId === game.bgg_id
                                  ? 'bg-[#8367C7] text-white border-[#8367C7]'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {game.name} (BGG #{game.bgg_id})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        onClick={() => handleBindGame(item)}
                        disabled={loadingId === item.id}
                        className="text-xs bg-[#8367C7] hover:bg-[#7256b6] text-white font-bold px-4 py-2 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                      >
                        {loadingId === item.id ? 'Guardando...' : 'Vincular juego'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
