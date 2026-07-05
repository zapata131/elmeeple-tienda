import { detectLanguage, parseGoogleFeed } from '@/utils/feed_parser';

describe('US-70: Correlate Edition Language Directly from Shopify XML Feed Content', () => {
  it('detects explicit language tags in XML block or summary', () => {
    expect(detectLanguage('Catan', '<g:language>es</g:language>')).toBe('es');
    expect(detectLanguage('Wingspan', '<language>english</language>')).toBe('en');
    expect(detectLanguage('Revive', '<g:language>de</g:language>')).toBe('de');
  });

  it('detects edition keywords in title or summary description', () => {
    expect(detectLanguage('Arcs Edición en Español', 'Juego espacial')).toBe('es');
    expect(detectLanguage('Dune Imperium English Edition', 'Board game')).toBe('en');
    expect(detectLanguage('Harmonies Edición Multilingüe', 'Idioma independiente')).toBe('multi');
  });

  it('populates correlated language inside parseGoogleFeed output items', () => {
    const xml = `
    <feed xmlns="http://www.w3.org/2005/Atom" xmlns:s="http://jadedpixel.com/-/spec/shopify">
      <entry>
        <title>Arcs (English Edition)</title>
        <link rel="alternate" type="text/html" href="https://fichaydado.com/products/arcs"/>
        <summary type="html">Leder games space opera in English.</summary>
        <s:price currency="MXN">1450.00</s:price>
      </entry>
      <entry>
        <title>Faraway Edición en Español</title>
        <link rel="alternate" type="text/html" href="https://fichaydado.com/products/faraway"/>
        <summary type="html">Juego en castellano.</summary>
        <s:price currency="MXN">450.00</s:price>
      </entry>
    </feed>
    `;

    const parsed = parseGoogleFeed(xml);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].language).toBe('en');
    expect(parsed[1].language).toBe('es');
  });
});
