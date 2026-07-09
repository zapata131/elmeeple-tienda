import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MerchantFeedInspector } from '@/components/MerchantFeedInspector';

describe('US-99: Interactive Merchant Feed Inspection & Diagnostic Debugger', () => {
  const sampleXmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Tienda Ejemplo</title>
    <item>
      <title>Catan: El Juego</title>
      <link>https://tienda.com/catan</link>
      <g:price>39.90 EUR</g:price>
      <g:availability>in stock</g:availability>
      <g:gtin>8436017220014</g:gtin>
    </item>
    <item>
      <title>Wingspan (Edición Española)</title>
      <link>https://tienda.com/wingspan</link>
      <g:price>55.00 EUR</g:price>
      <g:availability>in stock</g:availability>
    </item>
    <item>
      <title>Fundas Premium Mayday 63.5x88mm (100 unidades)</title>
      <link>https://tienda.com/fundas-mayday</link>
      <g:price>3.50 EUR</g:price>
      <g:availability>in stock</g:availability>
      <g:product_type>Accesorios > Fundas</g:product_type>
    </item>
    <item>
      <title>Pintura Citadel Leadbelcher (12ml)</title>
      <link>https://tienda.com/pintura-citadel</link>
      <g:price>4.20 EUR</g:price>
      <g:availability>in stock</g:availability>
      <g:product_type>Pinturas > Miniaturas</g:product_type>
    </item>
    <item>
      <title>Juego Sin Precio Ni Enlace</title>
      <link></link>
      <g:price>0.00 EUR</g:price>
      <g:availability>out of stock</g:availability>
    </item>
  </channel>
</rss>`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input for feed URL and inspect button in sentence case', () => {
    render(<MerchantFeedInspector initialFeedUrl="https://tienda.es/feed.xml" />);

    expect(screen.getByText('Inspección y diagnóstico de feed en tiempo real')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/introduce url del feed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /inspeccionar feed/i })).toBeInTheDocument();
  });

  it('analyzes sample XML content and displays diagnostic summary metrics', async () => {
    render(<MerchantFeedInspector initialXmlContent={sampleXmlFeed} />);

    const btnInspect = screen.getByRole('button', { name: /inspeccionar feed/i });
    fireEvent.click(btnInspect);

    await waitFor(() => {
      expect(screen.getByText(/resumen del diagnóstico/i)).toBeInTheDocument();
    });

    expect(screen.getByText('5')).toBeInTheDocument(); // total items
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1); // matched items count or excluded
  });

  it('categorizes non-boardgame items (sleeves, paints) into excluded list with reasons', async () => {
    render(<MerchantFeedInspector initialXmlContent={sampleXmlFeed} />);

    fireEvent.click(screen.getByRole('button', { name: /inspeccionar feed/i }));

    await waitFor(() => {
      expect(screen.getByText(/resumen del diagnóstico/i)).toBeInTheDocument();
    });

    const excludedTab = screen.getByRole('button', { name: /elementos excluidos/i });
    fireEvent.click(excludedTab);

    expect(screen.getByText('Fundas Premium Mayday 63.5x88mm (100 unidades)')).toBeInTheDocument();
    expect(screen.getByText('Pintura Citadel Leadbelcher (12ml)')).toBeInTheDocument();
  });

  it('flags diagnostic warnings for items with missing price or broken link', async () => {
    render(<MerchantFeedInspector initialXmlContent={sampleXmlFeed} />);

    fireEvent.click(screen.getByRole('button', { name: /inspeccionar feed/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /advertencias de diagnóstico/i })).toBeInTheDocument();
    });

    const warningsTab = screen.getByRole('button', { name: /advertencias de diagnóstico/i });
    fireEvent.click(warningsTab);

    expect(screen.getByText('Juego Sin Precio Ni Enlace')).toBeInTheDocument();
  });

  it('loads and analyzes sample demo feed on sample button click', async () => {
    render(<MerchantFeedInspector />);

    const demoBtn = screen.getByRole('button', { name: /cargar feed de prueba/i });
    fireEvent.click(demoBtn);

    const btnInspect = screen.getByRole('button', { name: /inspeccionar feed/i });
    fireEvent.click(btnInspect);

    await waitFor(() => {
      expect(screen.getByText(/resumen del diagnóstico/i)).toBeInTheDocument();
    });
  });

  it('contains zero raw unicode emojis', () => {
    const { container } = render(<MerchantFeedInspector initialXmlContent={sampleXmlFeed} />);
    fireEvent.click(screen.getByRole('button', { name: /inspeccionar feed/i }));

    const textContent = container.textContent || '';
    const bannedEmojis = ['🎲', '🔥', '🌍', '💸', '📦', '🏪', '✨', '⚠️', '📈', '📊', '⚡', '❌', '✅'];
    bannedEmojis.forEach((emoji) => {
      expect(textContent).not.toContain(emoji);
    });
  });
});
