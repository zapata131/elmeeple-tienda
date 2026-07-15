'use client';

import React, { useState } from 'react';
import { cleanBoardGameTitle, isLikelyBoardGame } from '@/utils/feed_parser';

export interface MerchantFeedInspectorProps {
  initialFeedUrl?: string;
  initialXmlContent?: string;
}

export interface InspectionResultItem {
  id: string;
  title: string;
  cleanTitle: string;
  price: number;
  stock: number;
  link: string;
  ean: string | null;
  isBoardGame: boolean;
  exclusionReason?: string;
  warnings: string[];
}

const SAMPLE_DEMO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Tienda Demo Juegos de Mesa</title>
    <item>
      <title>Catan: El Juego (Devir)</title>
      <link>https://tienda-demo.es/juegos/catan</link>
      <g:price>39.90 EUR</g:price>
      <g:availability>in stock</g:availability>
      <g:gtin>8436017220014</g:gtin>
    </item>
    <item>
      <title>Wingspan (Edición Española)</title>
      <link>https://tienda-demo.es/juegos/wingspan</link>
      <g:price>54.95 EUR</g:price>
      <g:availability>in stock</g:availability>
    </item>
    <item>
      <title>Fundas Mayday Premium 63.5x88mm (100u)</title>
      <link>https://tienda-demo.es/accesorios/fundas-mayday</link>
      <g:price>3.50 EUR</g:price>
      <g:availability>in stock</g:availability>
      <g:product_type>Accesorios > Fundas</g:product_type>
    </item>
    <item>
      <title>Pintura Citadel Leadbelcher (12ml)</title>
      <link>https://tienda-demo.es/pinturas/citadel-leadbelcher</link>
      <g:price>4.20 EUR</g:price>
      <g:availability>in stock</g:availability>
      <g:product_type>Pinturas > Miniaturas</g:product_type>
    </item>
    <item>
      <title>Funko Pop! Geralt de Rivia - Witcher</title>
      <link>https://tienda-demo.es/merch/funko-geralt</link>
      <g:price>14.99 EUR</g:price>
      <g:availability>in stock</g:availability>
      <g:product_type>Merchandising > Funko</g:product_type>
    </item>
    <item>
      <title>Juego Sin Precio Ni Enlace</title>
      <link></link>
      <g:price>0.00 EUR</g:price>
      <g:availability>out of stock</g:availability>
    </item>
  </channel>
</rss>`;

export function isNonBoardGameItem(title: string, productType: string = '', contentBlock: string = ''): boolean {
  const combined = `${title} ${productType} ${contentBlock}`.toLowerCase();
  
  const excludedRegexes = [
    /\bfundas?\b/i,
    /\bsleeves?\b/i,
    /\bmicas\b/i,
    /\bpinturas?\b/i,
    /\bcitadel\b/i,
    /\bpincel\b/i,
    /\bfiguras?\b/i,
    /\bmaqueta\b/i,
    /\bropa\b/i,
    /\bmerchandising\b/i,
    /\bpeluche\b/i,
    /\bfunko\b/i,
    /\bdados\b/i,
    /\bplaymats?\b/i,
  ];

  for (const regex of excludedRegexes) {
    if (regex.test(combined) && !combined.includes('juego de mesa') && !combined.includes('board game')) {
      return true;
    }
  }

  return !isLikelyBoardGame(title, contentBlock, productType);
}

function getExclusionReason(title: string, productType: string = ''): string {
  const combined = `${title} ${productType}`.toLowerCase();
  if (combined.includes('funda') || combined.includes('sleeves') || combined.includes('micas')) {
    return 'Accesorios / Fundas de cartas';
  }
  if (combined.includes('pintura') || combined.includes('citadel') || combined.includes('primer') || combined.includes('pincel')) {
    return 'Pinturas y herramientas de miniaturas';
  }
  if (combined.includes('funko') || combined.includes('peluche') || combined.includes('figura') || combined.includes('t-shirt')) {
    return 'Peluches / Merchandising / Figuras';
  }
  if (combined.includes('dice') || combined.includes('dados') || combined.includes('playmat') || combined.includes('tapete')) {
    return 'Accesorios / Dados / Tapetes';
  }
  return 'Producto no clasificado como juego de mesa';
}

export function MerchantFeedInspector({ initialFeedUrl = '', initialXmlContent = '' }: MerchantFeedInspectorProps) {
  const [feedUrl, setFeedUrl] = useState(initialFeedUrl);
  const [xmlInput, setXmlInput] = useState(initialXmlContent);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'matched' | 'excluded' | 'warnings'>('matched');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [matchedItems, setMatchedItems] = useState<InspectionResultItem[]>([]);
  const [excludedItems, setExcludedItems] = useState<InspectionResultItem[]>([]);
  const [warningItems, setWarningItems] = useState<InspectionResultItem[]>([]);

  const handleInspect = async () => {
    setIsAnalyzing(true);
    setErrorMsg('');

    try {
      let xmlText = xmlInput.trim();

      if (feedUrl && !xmlText) {
        try {
          const res = await fetch(feedUrl);
          if (res.ok) {
            xmlText = await res.text();
          } else {
            setErrorMsg(`No se pudo obtener el feed desde la URL (Estado: ${res.status}).`);
            setIsAnalyzing(false);
            return;
          }
        } catch {
          xmlText = SAMPLE_DEMO_XML;
        }
      }

      if (!xmlText) {
        xmlText = SAMPLE_DEMO_XML;
      }

      const entryRegex = /<(?:item|entry)[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi;
      let match;
      const parsedList: InspectionResultItem[] = [];

      let index = 0;
      while ((match = entryRegex.exec(xmlText)) !== null) {
        const block = match[1];

        const getTagValue = (tagPattern: string) => {
          const regex = new RegExp(`<${tagPattern}[^>]*>([\\s\\S]*?)<\\/${tagPattern.split(' ')[0].replace(/[^a-zA-Z0-9:-]/g, '')}>`, 'i');
          const m = regex.exec(block);
          return m ? m[1].trim() : '';
        };

        const title = getTagValue('title') || `Item #${index + 1}`;
        let link = getTagValue('link') || '';
        if (!link) {
          const linkMatch = /<link[^>]*?href=["']([^"']+)["']/i.exec(block);
          if (linkMatch) link = linkMatch[1];
        }

        const getPriceValue = () => {
          const sPriceMatch = /<s:price[^>]*>([0-9.,]+)<\/s:price>/i.exec(block);
          if (sPriceMatch) return sPriceMatch[1];
          const gPriceMatch = /<g:price[^>]*>([0-9.,]+)/i.exec(block);
          if (gPriceMatch) return gPriceMatch[1];
          const priceMatch = /<price[^>]*>([0-9.,]+)/i.exec(block);
          if (priceMatch) return priceMatch[1];
          return '';
        };

        const rawPrice = getPriceValue();
        const price = parseFloat(rawPrice.replace(/,/g, '')) || 0;

        const availability = getTagValue('g:availability') || block;
        const stock = availability.toLowerCase().includes('out of stock') || availability.toLowerCase().includes('agotado') ? 0 : 1;
        const ean = getTagValue('g:gtin') || getTagValue('s:sku') || null;
        const productType = getTagValue('s:type') || getTagValue('g:product_type') || getTagValue('category') || '';

        const nonBoardgame = isNonBoardGameItem(title, productType, block);

        const itemWarnings: string[] = [];
        if (price <= 0) {
          itemWarnings.push('Precio no válido (0 €) / ausente');
        }
        if (!link || !link.startsWith('http')) {
          itemWarnings.push('Enlace ausente o inválido');
        }
        if (stock === 0) {
          itemWarnings.push('Sin existencias (Agotado)');
        }

        const cleanTitle = cleanBoardGameTitle(title);
        const exclusionReason = nonBoardgame ? getExclusionReason(title, productType) : undefined;

        parsedList.push({
          id: `item-${index}`,
          title,
          cleanTitle,
          price,
          stock,
          link,
          ean,
          isBoardGame: !nonBoardgame,
          exclusionReason,
          warnings: itemWarnings,
        });

        index++;
      }

      const matched = parsedList.filter((item) => item.isBoardGame && item.price > 0 && item.link);
      const excluded = parsedList.filter((item) => !item.isBoardGame);
      const warnings = parsedList.filter((item) => item.warnings.length > 0);

      setMatchedItems(matched);
      setExcludedItems(excluded);
      setWarningItems(warnings);
      setHasAnalyzed(true);

    } catch {
      setErrorMsg('Error al procesar el feed XML. Verifique el formato.');
    } fontally: {
      setIsAnalyzing(false);
    }
  };

  const handleLoadDemo = () => {
    setXmlInput(SAMPLE_DEMO_XML);
    setFeedUrl('');
  };

  const totalProcessed = matchedItems.length + excludedItems.length + (warningItems.filter(w => w.isBoardGame && (w.price <= 0 || !w.link)).length);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col gap-6 p-6 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-950">Inspección y diagnóstico de feed en tiempo real</h2>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full uppercase border border-indigo-200">
            Inspector XML / JSON
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Pegue la URL de su catálogo o datos XML para previsualizar juegos reconocidos, detectar accesorios excluidos y resaltar errores de precio o enlaces.
        </p>
      </div>

      {/* Inputs Section */}
      <div className="flex flex-col gap-4 bg-gray-50 border border-gray-200 p-5 rounded-xl">
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          <input
            type="url"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            placeholder="Introduce URL del feed (ej: https://tutienda.com/google-feed.xml)..."
            className="flex-1 text-xs border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <div className="flex gap-2">
            <button
              onClick={handleInspect}
              disabled={isAnalyzing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Inspeccionar feed</span>
                </>
              )}
            </button>

            <button
              onClick={handleLoadDemo}
              type="button"
              className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
            >
              Cargar feed de prueba
            </button>
          </div>
        </div>

        <details className="text-xs text-gray-600">
          <summary className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-800">
            ¿Deseas pegar código XML directamente? Haz clic para expandir
          </summary>
          <textarea
            value={xmlInput}
            onChange={(e) => setXmlInput(e.target.value)}
            rows={6}
            placeholder="Pegue aquí el contenido XML del feed..."
            className="w-full text-xs font-mono border border-gray-300 rounded-lg p-3 mt-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </details>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Diagnostic Output Results */}
      {hasAnalyzed && (
        <div className="flex flex-col gap-6 mt-2">
          
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="text-sm font-bold text-gray-950">Resumen del diagnóstico</h3>
            <span className="text-xs text-gray-500 font-medium">Análisis completado en tiempo real</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total procesados</span>
              <span className="text-2xl font-extrabold text-gray-900 mt-1">{totalProcessed}</span>
              <span className="text-[10px] text-gray-500 mt-1">Artículos en feed</span>
            </div>

            <div className="bg-green-50/70 border border-green-200 rounded-xl p-4 flex flex-col">
              <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Juegos reconocidos</span>
              <span className="text-2xl font-extrabold text-green-900 mt-1">{matchedItems.length}</span>
              <span className="text-[10px] text-green-700 mt-1">Catalogados con éxito</span>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col">
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Elementos excluidos</span>
              <span className="text-2xl font-extrabold text-amber-900 mt-1">{excludedItems.length}</span>
              <span className="text-[10px] text-amber-700 mt-1">Accesorios y pinturas</span>
            </div>

            <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 flex flex-col">
              <span className="text-[10px] text-red-700 font-bold uppercase tracking-wider">Advertencias</span>
              <span className="text-2xl font-extrabold text-red-900 mt-1">{warningItems.length}</span>
              <span className="text-[10px] text-red-700 mt-1">Precios o enlaces rotos</span>
            </div>

          </div>

          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('matched')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'matched'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Juegos reconocidos ({matchedItems.length})
            </button>

            <button
              onClick={() => setActiveTab('excluded')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'excluded'
                  ? 'border-amber-600 text-amber-700 bg-amber-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Elementos excluidos ({excludedItems.length})
            </button>

            <button
              onClick={() => setActiveTab('warnings')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'warnings'
                  ? 'border-red-600 text-red-700 bg-red-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Advertencias de diagnóstico ({warningItems.length})
            </button>
          </div>

          {activeTab === 'matched' && (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Título en feed</th>
                    <th className="px-4 py-3">Título limpio</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">EAN / GTIN</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {matchedItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                        No se han encontrado juegos reconocidos en esta inspección.
                      </td>
                    </tr>
                  ) : (
                    matchedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{item.title}</td>
                        <td className="px-4 py-3 text-indigo-700">{item.cleanTitle}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono">{item.ean || 'N/D'}</td>
                        <td className="px-4 py-3">
                          <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded">
                            Apto para catálogo
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'excluded' && (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead>
                  <tr className="bg-amber-50/50 border-b border-gray-200 text-amber-800 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Título excluido</th>
                    <th className="px-4 py-3">Categoría / Motivo de exclusión</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Acción sugerida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {excludedItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                        No se detectaron artículos no pertenecientes a juegos de mesa.
                      </td>
                    </tr>
                  ) : (
                    excludedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-amber-50/30">
                        <td className="px-4 py-3 font-semibold text-gray-900">{item.title}</td>
                        <td className="px-4 py-3">
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {item.exclusionReason || 'No es juego de mesa'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-700">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-[11px] text-gray-500">
                          Excluido automáticamente para no contaminar la comparativa de precios.
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'warnings' && (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs text-gray-700 border-collapse">
                <thead>
                  <tr className="bg-red-50/50 border-b border-gray-200 text-red-800 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Artículo con incidencia</th>
                    <th className="px-4 py-3">Detalle del error detectado</th>
                    <th className="px-4 py-3">Enlace registrado</th>
                    <th className="px-4 py-3">Recomendación de corrección</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {warningItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                        No se encontraron advertencias ni errores en el feed inspeccionado.
                      </td>
                    </tr>
                  ) : (
                    warningItems.map((item) => (
                      <tr key={item.id} className="hover:bg-red-50/30">
                        <td className="px-4 py-3 font-semibold text-gray-900">{item.title}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {item.warnings.map((w, idx) => (
                              <span key={idx} className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                                {w}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-gray-500 truncate max-w-[200px]">
                          {item.link || 'Sin URL asignada'}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-gray-600">
                          Añada un precio mayor a 0 y una URL válida en el XML de su tienda.
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
