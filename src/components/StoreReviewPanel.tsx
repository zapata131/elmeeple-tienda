'use client';

import React, { useState } from 'react';

export interface StoreReviewItem {
  id: string;
  userName: string;
  rating: number;
  tags: string[];
  comment: string;
  createdAt: string;
}

interface Props {
  storeId: string;
  storeName: string;
  initialReviews: StoreReviewItem[];
  initialAvgRating: number;
  initialTagCounts: Record<string, number>;
}

const AVAILABLE_VIBE_TAGS = [
  'Esquinas Protegidas',
  'Caja Doble',
  'Envío Rápido',
  'Embalaje Ecológico',
  'Plástico Burbuja Extra',
];

export function StoreReviewPanel({
  storeId,
  storeName,
  initialReviews,
  initialAvgRating,
  initialTagCounts,
}: Props) {
  const [reviews, setReviews] = useState<StoreReviewItem[]>(initialReviews);
  const [avgRating, setAvgRating] = useState(initialAvgRating);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>(initialTagCounts);

  // Form State
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Esquinas Protegidas']);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) {
      alert('Por favor rellena tu nombre y comentario.');
      return;
    }
    setSubmitting(true);
    setMsg('');
    try {
      const res = await fetch('/api/store/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          userName: userName.trim(),
          rating,
          tags: selectedTags,
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        const newReview: StoreReviewItem = {
          id: `local-${Date.now()}`,
          userName: userName.trim(),
          rating,
          tags: selectedTags,
          comment: comment.trim(),
          createdAt: new Date().toISOString().split('T')[0],
        };

        const updatedReviews = [newReview, ...reviews];
        setReviews(updatedReviews);

        const newAvg = Number(
          (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
        );
        setAvgRating(newAvg);

        const nextTagCounts = { ...tagCounts };
        for (const t of selectedTags) {
          nextTagCounts[t] = (nextTagCounts[t] || 0) + 1;
        }
        setTagCounts(nextTagCounts);

        setMsg('¡Valoración publicada con éxito!');
        setUserName('');
        setComment('');
      }
    } catch {
      setMsg('Error de red.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Store Header & Vibe Tags Overview */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">{storeName} - Valoraciones & Vibe Tags</h2>
          <p className="text-xs text-gray-500 mt-1">
            Reputación lúdica comunitaria y control de calidad en protección del embalaje en ruta.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-indigo-50 border border-indigo-150 px-5 py-3 rounded-2xl shrink-0">
          <div className="flex items-center gap-1.5 text-3xl font-black text-indigo-950">
            <svg className="w-7 h-7 text-amber-500 fill-amber-500" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>{avgRating}</span>
          </div>
          <div className="flex flex-col text-[11px] font-bold text-indigo-800">
            <span>Puntuación Media</span>
            <span className="text-gray-500 font-normal">{reviews.length} valoraciones</span>
          </div>
        </div>
      </div>

      {/* Vibe Tag Cloud */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
          Etiquetas de Embalaje Destacadas por la Comunidad
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {Object.entries(tagCounts).map(([tag, count]) => (
            <span
              key={tag}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-sm"
            >
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-[#8367C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>{tag}</span>
              </span>
              <span className="bg-emerald-200/80 text-emerald-950 px-2 py-0.5 rounded-full text-[10px] font-mono">
                {count}
              </span>
            </span>
          ))}
          {Object.keys(tagCounts).length === 0 && (
            <span className="text-xs text-gray-400 font-medium">Aún no hay etiquetas asignadas.</span>
          )}
        </div>
      </div>

      {/* New Review Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-extrabold text-gray-900">Escribir una Valoración sobre {storeName}</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tu Nombre / Nick</label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Ej. Sofía Gamer"
              className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Puntuación (Estrellas)</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
            >
              <option value={5}>★★★★★ (5 - Excelente protección)</option>
              <option value={4}>★★★★ (4 - Muy bueno)</option>
              <option value={3}>★★★ (3 - Regular)</option>
              <option value={2}>★★ (2 - Mejorable)</option>
              <option value={1}>★ (1 - Esquinas dañadas)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">Vibe Tags (Selecciona los aplicables)</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_VIBE_TAGS.map((tag) => {
              const isSel = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all border ${
                    isSel
                      ? 'bg-indigo-650 text-white border-indigo-700 shadow-sm'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {isSel ? '✓ ' : '+ '} {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Comentario sobre el Embalaje y Envío</label>
          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe tu experiencia sobre el embalaje, protección con plástico burbuja, etc..."
            className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Publicando...' : 'Publicar Valoración'}
          </button>
          {msg && (
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{msg}</span>
            </span>
          )}
        </div>
      </form>

      {/* Reviews List */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-extrabold text-gray-900">Opiniones de la Comunidad ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-xs text-gray-400 font-medium">
            Sé el primer meeple en valorar la calidad de embalaje de esta tienda.
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-xs">
                    {rev.userName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <span className="text-xs font-extrabold text-gray-900 block">{rev.userName}</span>
                    <span className="text-[10px] text-gray-400">{rev.createdAt}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-500">
                  {'★'.repeat(rev.rating)}
                </span>
              </div>

              {rev.tags && rev.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {rev.tags.map((t) => (
                    <span key={t} className="bg-gray-100 text-gray-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <svg className="w-3 h-3 text-[#8367C7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-150">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
