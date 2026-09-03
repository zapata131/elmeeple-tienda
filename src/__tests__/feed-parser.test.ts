import { describe, it, expect } from 'vitest';
import {
  isBoardGameFeedItem,
  classifyFeedItemType,
  parseShopifyJsonFeed,
  parseGoogleXmlFeed,
} from '../lib/engine/feed-parser';

describe('Sprint 2: Feed Parser & Non-Game Classifiers (US-10, US-16, US-17)', () => {
  describe('isBoardGameFeedItem (US-16 Non-Game Exclusion)', () => {
    it('should identify legitimate board games', () => {
      expect(isBoardGameFeedItem('Catan El Juego')).toBe(true);
      expect(isBoardGameFeedItem('Wingspan')).toBe(true);
      expect(isBoardGameFeedItem('Carcassonne')).toBe(true);
      expect(isBoardGameFeedItem('Aventureros al Tren: Europa')).toBe(true);
    });

    it('should preserve games with "dice" or "cartas" in the authentic game title', () => {
      expect(isBoardGameFeedItem('Dice Throne Season 1')).toBe(true);
      expect(isBoardGameFeedItem('Roll for the Galaxy')).toBe(true);
      expect(isBoardGameFeedItem('Trio - Juego de Cartas')).toBe(true);
    });

    it('should discard non-game accessories (sleeves, dice, playmats, deck boxes)', () => {
      expect(isBoardGameFeedItem('Fundas Mayday Standard 100u')).toBe(false);
      expect(isBoardGameFeedItem('Dragon Shield Sleeves Matte Black')).toBe(false);
      expect(isBoardGameFeedItem('Set de dados poliédricos D20')).toBe(false);
      expect(isBoardGameFeedItem('Playmat Tapete Neopreno Catan')).toBe(false);
      expect(isBoardGameFeedItem('Deck Box Ultra Pro Black')).toBe(false);
      expect(isBoardGameFeedItem('Sobre Booster Pack Pokémon TCG')).toBe(false);
      expect(isBoardGameFeedItem('Inserto de madera para Terraforming Mars')).toBe(false);
    });
  });

  describe('classifyFeedItemType (US-17 Base Game vs Expansion vs Spin-off)', () => {
    it('should classify base games as "boardgame"', () => {
      expect(classifyFeedItemType('Catan')).toBe('boardgame');
      expect(classifyFeedItemType('Cascadia')).toBe('boardgame');
      expect(classifyFeedItemType('Azul')).toBe('boardgame');
    });

    it('should classify expansions as "expansion"', () => {
      expect(classifyFeedItemType('Catan: Navegantes - Expansión')).toBe('expansion');
      expect(classifyFeedItemType('Wingspan: Expansión de Oceanía')).toBe('expansion');
      expect(classifyFeedItemType('Carcassonne Ampliación Posadas y Catedrales')).toBe('expansion');
      expect(classifyFeedItemType('7 Wonders Architects: Extension')).toBe('expansion');
    });

    it('should classify spin-offs as "spinoff" (US-05)', () => {
      expect(classifyFeedItemType('Spot It! Catan')).toBe('spinoff');
      expect(classifyFeedItemType('Dobble Catan')).toBe('spinoff');
      expect(classifyFeedItemType('Catan Junior')).toBe('spinoff');
    });

    it('should classify accessories as "accessory"', () => {
      expect(classifyFeedItemType('Fundas Protectoras Premium 63.5x88')).toBe('accessory');
      expect(classifyFeedItemType('Dados D6 Rojos 16mm')).toBe('accessory');
    });
  });

  describe('parseShopifyJsonFeed (US-10 Shopify JSON Ingestion)', () => {
    it('should correctly parse Shopify products.json payload into FeedItems', () => {
      const mockShopifyData = {
        products: [
          {
            id: 1001,
            title: 'Catan',
            handle: 'catan-juego-base',
            images: [{ src: 'https://fichaydado.com/cdn/catan.jpg' }],
            variants: [
              {
                id: 2001,
                price: '999.00',
                sku: 'CAT-01',
                barcode: '8436017220017',
              },
            ],
          },
          {
            id: 1002,
            title: 'Fundas Mayday Standard 100u',
            handle: 'fundas-mayday',
            images: [{ src: 'https://fichaydado.com/cdn/fundas.jpg' }],
            variants: [
              {
                id: 2002,
                price: '80.00',
                sku: 'MAY-100',
                barcode: '080112345678',
              },
            ],
          },
        ],
      };

      const items = parseShopifyJsonFeed(mockShopifyData, 'fichaydado.com');
      expect(items).toHaveLength(2);
      expect(items[0]).toEqual({
        raw_title: 'Catan',
        product_url: 'https://fichaydado.com/products/catan-juego-base',
        price: 999.0,
        sku: 'CAT-01',
        barcode: '8436017220017',
        image_url: 'https://fichaydado.com/cdn/catan.jpg',
        item_type: 'boardgame',
      });
      expect(items[1].item_type).toBe('accessory');
    });
  });

  describe('parseGoogleXmlFeed (US-10 Google / Atom XML Ingestion)', () => {
    it('should parse Atom XML with entries', () => {
      const mockXml = `<?xml version="1.0" encoding="utf-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <title>Wingspan</title>
          <link href="https://rollgames.mx/products/wingspan" />
          <summary>Un juego de aves fascinante</summary>
          <s:price xmlns:s="http://schema.org/">1350.00</s:price>
        </entry>
      </feed>`;

      const items = parseGoogleXmlFeed(mockXml);
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].raw_title).toBe('Wingspan');
      expect(items[0].product_url).toBe('https://rollgames.mx/products/wingspan');
      expect(items[0].price).toBe(1350.0);
    });
  });
});
