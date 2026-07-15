import { isLikelyBoardGame, parseGoogleFeed } from '@/utils/feed_parser';

describe('US-63: Paginated Shopify Atom Feed Roll & Strict Board Game Filtering', () => {
  describe('isLikelyBoardGame classification filter', () => {
    it('permissively accepts all feed items for catalog ingestion', () => {
      expect(isLikelyBoardGame('Catan Edición en Español', 'Juego de mesa clásico de negociación')).toBe(true);
      expect(isLikelyBoardGame('Wingspan', 'Atrae hermosas aves a tu reserva natural')).toBe(true);
      expect(isLikelyBoardGame('Sky Team', 'Juego cooperativo de dados para 2 pilotos')).toBe(true);
      expect(isLikelyBoardGame('Brass: Birmingham Deluxe', 'Estrategia económica en la revolución industrial')).toBe(true);
      expect(isLikelyBoardGame('Fundas Mayday 63.5x88mm 100 piezas', 'Protege tus cartas contra desgaste')).toBe(true);
      expect(isLikelyBoardGame('Pintura Vallejo Model Color Blanco 17ml', 'Acrílico para modelismo')).toBe(true);
    });
  });

  describe('Shopify Atom XML feed parser with entry parsing', () => {
    it('extracts all entries from Atom feed XML without dropping valid items', () => {
      const sampleAtomXml = `
      <feed xmlns="http://www.w3.org/2005/Atom" xmlns:s="http://jadedpixel.com/-/spec/shopify">
        <entry>
          <title>Harmonies</title>
          <link rel="alternate" type="text/html" href="https://fichaydado.com/products/harmonies"/>
          <summary type="html">Juego de mesa de colocación de fichas y naturaleza.</summary>
          <s:price currency="MXN">750.00</s:price>
        </entry>
        <entry>
          <title>Fundas Mayday 63.5x88mm</title>
          <link rel="alternate" type="text/html" href="https://fichaydado.com/products/fundas-mayday"/>
          <summary type="html">Micas protectoras de cartas.</summary>
          <s:price currency="MXN">55.00</s:price>
        </entry>
        <entry>
          <title>Sky Team</title>
          <link rel="alternate" type="text/html" href="https://fichaydado.com/products/sky-team"/>
          <summary type="html">Aterriza tu avión comercial en este juego cooperativo.</summary>
          <s:price currency="MXN">680.00</s:price>
        </entry>
      </feed>
      `;

      const parsed = parseGoogleFeed(sampleAtomXml);
      expect(parsed).toHaveLength(3);
      expect(parsed[0].title).toBe('Harmonies');
      expect(parsed[0].price).toBe(750);
      expect(parsed[2].title).toBe('Sky Team');
      expect(parsed[2].price).toBe(680);
    });

    it('extracts exact currency prices from Shopify Atom s:variant entries', () => {
      const variantXml = `
      <feed xmlns="http://www.w3.org/2005/Atom" xmlns:s="http://jadedpixel.com/-/spec/shopify">
        <entry>
          <title>Brass Birmingham Deluxe</title>
          <link rel="alternate" type="text/html" href="https://store.mx/products/brass"/>
          <s:variant>
            <s:price currency="MXN">1850.00</s:price>
          </s:variant>
        </entry>
      </feed>
      `;

      const parsed = parseGoogleFeed(variantXml);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe('Brass Birmingham Deluxe');
      expect(parsed[0].price).toBe(1850.00);
    });
  });

  describe('Unbounded paginated feed traversal', () => {
    it('fetches beyond 15 pages when store returns distinct page entries', async () => {
      const { fetchFullStoreFeed } = await import('@/utils/feed_parser');
      const originalFetch = global.fetch;
      const mockFetch = jest.fn().mockImplementation(async (url: RequestInfo | URL) => {
        const urlStr = String(url);
        const match = urlStr.match(/\?page=(\d+)/);
        const pageNum = match ? parseInt(match[1], 10) : 1;

        if (pageNum <= 18) {
          const xml = `
            <feed xmlns="http://www.w3.org/2005/Atom" xmlns:s="http://jadedpixel.com/-/spec/shopify">
              <entry>
                <title>Game Page ${pageNum}</title>
                <link rel="alternate" type="text/html" href="https://store.mx/products/game-page-${pageNum}"/>
                <summary type="html">Juego de mesa de estrategia en página ${pageNum}</summary>
                <s:price currency="MXN">500.00</s:price>
              </entry>
            </feed>
          `;
          return { ok: true, text: async () => xml } as Response;
        }
        return { ok: true, text: async () => '<feed></feed>' } as Response;
      });

      global.fetch = mockFetch as unknown as typeof fetch;

      try {
        const items = await fetchFullStoreFeed('https://store.mx/collections/all.atom');
        expect(items).toHaveLength(18);
        expect(mockFetch).toHaveBeenCalledTimes(19);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});
