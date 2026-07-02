'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

export function OnboardingWizard() {
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);

  // Form values state
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [shippingFlat, setShippingFlat] = useState('');
  const [shippingThreshold, setShippingThreshold] = useState('');
  const [feedUrl, setFeedUrl] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === 'loading') {
    return <div className="text-sm text-gray-500 text-center py-12">Loading onboarding funnel...</div>;
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="max-w-md mx-auto bg-white border border-gray-250 p-8 rounded-xl shadow-sm text-center my-12 flex flex-col gap-4">
        <span className="text-3xl">🔒</span>
        <h2 className="text-lg font-bold text-gray-900">Acceso Restringido</h2>
        <p className="text-sm text-gray-600">
          Please sign in to onboard your board game store to MeeplePrecios.
        </p>
      </div>
    );
  }

  const handleNext1 = () => {
    setErrorMsg('');
    if (!name.trim() || !baseUrl.trim() || !slug.trim()) {
      setErrorMsg('Todos los campos de la tienda son obligatorios.');
      return;
    }
    setStep(2);
  };

  const handleNext2 = () => {
    setStep(3);
  };

  const handleNext3 = () => {
    setErrorMsg('');
    const priceVal = Number(shippingFlat);
    if (isNaN(priceVal) || priceVal < 0) {
      setErrorMsg('La tarifa de envío debe ser un número positivo.');
      return;
    }
    setStep(4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/merchant/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          base_url: baseUrl,
          slug,
          logo_url: logoUrl,
          shipping_flat: Number(shippingFlat),
          shipping_free_threshold: shippingThreshold ? Number(shippingThreshold) : null,
          feed_url: feedUrl,
        }),
      });

      if (res.ok) {
        setStep(5);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Hubo un fallo al registrar la tienda.');
      }
    } catch {
      setErrorMsg('Error de red. Inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white border border-gray-250 rounded-2xl shadow-sm p-8 my-12 flex flex-col gap-6">
      
      {/* Step Header */}
      {step < 5 && (
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Onboarding de Socio</h2>
          <span className="text-sm font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
            Paso {step} de 4
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-150 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-lg">
          ⚠️ {errorMsg}
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-lg text-gray-900">Paso 1: Información de la Tienda</h3>
          <p className="text-xs text-gray-500">Introduce el nombre oficial y datos de enlace de tu tienda.</p>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="store-name" className="text-xs font-bold text-gray-600 uppercase">Nombre de la Tienda</label>
            <input
              type="text"
              id="store-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dungeon Games"
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="store-url" className="text-xs font-bold text-gray-600 uppercase">URL Base de la Tienda</label>
            <input
              type="url"
              id="store-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="e.g. https://dungeongames.com"
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="store-slug" className="text-xs font-bold text-gray-600 uppercase">Identificador URL (Slug)</label>
            <input
              type="text"
              id="store-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. dungeongames"
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleNext1}
            className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-lg text-gray-900">Paso 2: Imagen y Logotipo</h3>
          <p className="text-xs text-gray-500">Proporciona el logotipo corporativo para mostrar en las ofertas del comparador.</p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="store-logo" className="text-xs font-bold text-gray-600 uppercase">URL del Logotipo</label>
            <input
              type="url"
              id="store-logo"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="e.g. https://dungeongames.com/logo.png"
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Atrás
            </button>
            <button
              onClick={handleNext2}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-lg text-gray-900">Paso 3: Gastos de Envío</h3>
          <p className="text-xs text-gray-500">Establece la tarifa de envío base predeterminada para España (ES).</p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="store-shipping-flat" className="text-xs font-bold text-gray-600 uppercase">Tarifa Plana (€)</label>
            <input
              type="number"
              id="store-shipping-flat"
              step="0.01"
              value={shippingFlat}
              onChange={(e) => setShippingFlat(e.target.value)}
              placeholder="e.g. 4.95"
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="store-shipping-threshold" className="text-xs font-bold text-gray-600 uppercase">Umbral de Envío Gratis (€)</label>
            <input
              type="number"
              id="store-shipping-threshold"
              step="0.01"
              value={shippingThreshold}
              onChange={(e) => setShippingThreshold(e.target.value)}
              placeholder="e.g. 60.00 (Opcional)"
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setStep(2)}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Atrás
            </button>
            <button
              onClick={handleNext3}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h3 className="font-bold text-lg text-gray-900">Paso 4: Feed de Google Shopping</h3>
          <p className="text-xs text-gray-500">Conecta tu catálogo subiendo el feed XML de Google Shopping. MeeplePrecios sincronizará los juegos a diario.</p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="store-feed" className="text-xs font-bold text-gray-600 uppercase">URL del Feed</label>
            <input
              type="url"
              id="store-feed"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="e.g. https://dungeongames.com/feeds/google.xml"
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg text-sm hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Registrando...' : 'Completar Registro'}
            </button>
          </div>
        </form>
      )}

      {step === 5 && (
        <div className="text-center flex flex-col gap-4 py-8">
          <span className="text-5xl">🎉</span>
          <h3 className="font-bold text-xl text-gray-900">Onboarding completado con éxito!</h3>
          <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
            Hemos registrado tu tienda. Nuestro equipo de administración verificará tu feed XML y activará las ofertas automáticamente en las próximas 24 horas.
          </p>
        </div>
      )}

    </div>
  );
}
