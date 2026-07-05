import { isLikelyBoardGame, parseGoogleFeed } from '@/utils/feed_parser';

describe('US-63: Paginated Shopify Atom Feed Roll & Strict Board Game Filtering', () => {
  describe('isLikelyBoardGame classification filter', () => {
    it('accepts legitimate board game titles and descriptions', () => {
      expect(isLikelyBoardGame('Catan Edición en Español', 'Juego de mesa clásico de negociación')).toBe(true);
      expect(isLikelyBoardGame('Wingspan', 'Atrae hermosas aves a tu reserva natural')).toBe(true);
      expect(isLikelyBoardGame('Sky Team', 'Juego cooperativo de dados para 2 pilotos')).toBe(true);
      expect(isLikelyBoardGame('Brass: Birmingham Deluxe', 'Estrategia económica en la revolución industrial')).toBe(true);
    });

    it('rejects card sleeves and game accessories', () => {
      expect(isLikelyBoardGame('Fundas Mayday 63.5x88mm 100 piezas', 'Protege tus cartas contra desgaste')).toBe(false);
      expect(isLikelyBoardGame('Sleeves Gamegenic Standard Card Game', 'Paquete de micas transparentes')).toBe(false);
      expect(isLikelyBoardGame('Protector de cartas Perfect Fit 64x89', 'Micas internas')).toBe(false);
    });

    it('rejects hobby paints, brushes, and miniatures supplies', () => {
      expect(isLikelyBoardGame('Pintura Vallejo Model Color Blanco 17ml', 'Acrílico para modelismo')).toBe(false);
      expect(isLikelyBoardGame('Pincel Citadel Detail Brush', 'Pincel sintético de precisión')).toBe(false);
      expect(isLikelyBoardGame('Aerógrafo Hobby 0.3mm', 'Herramienta para pintar miniaturas')).toBe(false);
    });

    it('rejects puzzles, TCG boosters, and loose dice sets', () => {
      expect(isLikelyBoardGame('Rompecabezas 1000 piezas Ravensburger', 'Puzzle clásico paisaje')).toBe(false);
      expect(isLikelyBoardGame('Sobre MTG Horizonte de Modern 3', 'Booster pack con 15 cartas')).toBe(false);
      expect(isLikelyBoardGame('Set de Dados D&D Poliedros D20', 'Dados acrílicos para rol')).toBe(false);
      expect(isLikelyBoardGame('Torre de dados de madera', 'Accesorio tirador de dados')).toBe(false);
    });
  });

  describe('Shopify Atom XML feed parser with entry parsing', () => {
    it('extracts real board game entries from Atom feed XML while ignoring non-board-game entries', () => {
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
      expect(parsed).toHaveLength(2);
      expect(parsed[0].title).toBe('Harmonies');
      expect(parsed[0].price).toBe(750);
      expect(parsed[1].title).toBe('Sky Team');
      expect(parsed[1].price).toBe(680);
    });
  });
});
