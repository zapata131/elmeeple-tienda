import { describe, it, expect } from 'vitest';
import {
  cleanBoardGameTitle,
  calculateSimilarityScore,
  matchFeedItem,
} from '../lib/engine/matching-engine';
import { CatalogGame, GameBarcode, MerchantProductMapping, FeedItem } from '../types';

describe('Sprint 3: 4-Tier Waterfall Matching Engine (US-05, US-11, US-12, US-13)', () => {
  describe('cleanBoardGameTitle (Noise Removal & Normalization)', () => {
    it('should strip publisher prefixes, language tags, and commercial fluff', () => {
      expect(cleanBoardGameTitle('Devir Catan Juego de Mesa Edición en Español')).toBe('catan');
      expect(cleanBoardGameTitle('Asmodee Wingspan Juego Base')).toBe('wingspan');
      expect(cleanBoardGameTitle('Aventureros al Tren Europa Nuevo Original')).toBe('aventureros al tren europa');
    });

    it('should preserve authentic subtitles and accented characters', () => {
      expect(cleanBoardGameTitle('Catan: El Duelo')).toBe('catan el duelo');
      expect(cleanBoardGameTitle('Pandemic: El Reino de Cthulhu')).toBe('pandemic el reino de cthulhu');
    });
  });

  describe('calculateSimilarityScore & Penalties (US-13)', () => {
    it('should return 1.0 for exact title matches', () => {
      expect(calculateSimilarityScore('Catan', 'Catan')).toBe(1.0);
      expect(calculateSimilarityScore('Wingspan', 'Wingspan')).toBe(1.0);
    });

    it('should penalize standalone spin-offs from matching the base game (US-05)', () => {
      // "Catan: El Duelo" should NOT match "Catan" base with high confidence
      const duelScore = calculateSimilarityScore('Catan: El Duelo', 'Catan');
      expect(duelScore).toBeLessThan(0.70);

      // "Catan Junior" should NOT match "Catan" base
      const juniorScore = calculateSimilarityScore('Catan Junior', 'Catan');
      expect(juniorScore).toBeLessThan(0.70);
    });

    it('should calculate high confidence (>= 0.92) for minor title spelling variances', () => {
      const score = calculateSimilarityScore('Catan El Juego', 'Catan');
      expect(score).toBeGreaterThanOrEqual(0.92);
    });
  });

  describe('matchFeedItem 4-Tier Waterfall Resolution', () => {
    const mockCatalog: CatalogGame[] = [
      {
        id: 'game-catan-001',
        slug: 'catan',
        title: 'Catan',
        original_title: 'The Settlers of Catan',
        alternate_titles: ['Los Colonos de Catan'],
        description: 'Juego de mesa clásico de comercio',
        image_url: 'https://images.example.com/catan.jpg',
        thumbnail_url: null,
        min_players: 3,
        max_players: 4,
        playing_time: 75,
        weight: 2.3,
        bgg_id: 13,
        bgg_rank: 450,
        item_type: 'boardgame',
        parent_game_id: null,
        is_verified: true,
      },
      {
        id: 'game-catan-duelo-002',
        slug: 'catan-el-duelo',
        title: 'Catan: El Duelo',
        original_title: 'Catan: The Duel',
        alternate_titles: [],
        description: 'Versión de cartas para 2 jugadores',
        image_url: 'https://images.example.com/catan-duelo.jpg',
        thumbnail_url: null,
        min_players: 2,
        max_players: 2,
        playing_time: 45,
        weight: 2.1,
        bgg_id: 278,
        bgg_rank: 800,
        item_type: 'spinoff',
        parent_game_id: 'game-catan-001',
        is_verified: true,
      },
    ];

    const mockBarcodes: GameBarcode[] = [
      {
        id: 'bc-1',
        game_id: 'game-catan-001',
        barcode: '8436017220017',
        barcode_type: 'EAN-13',
        edition_language: 'es',
      },
    ];

    const mockSkuMappings: MerchantProductMapping[] = [
      {
        id: 'map-1',
        store_id: 'store-ficha-001',
        merchant_sku: 'SKU-CATAN-DEVIR',
        raw_title: 'Catan Edición Especial Devir',
        game_id: 'game-catan-001',
        mapped_by: 'merchant',
      },
    ];

    it('Tier 1: should match deterministically on EAN-13 barcode with confidence 1.0', () => {
      const feedItem: FeedItem = {
        raw_title: 'Juego Random Sin Nombre Exacto',
        product_url: 'https://fichaydado.com/products/catan',
        price: 999,
        barcode: '8436017220017',
      };

      const result = matchFeedItem(feedItem, {
        catalog: mockCatalog,
        barcodes: mockBarcodes,
        skuMappings: mockSkuMappings,
        storeId: 'store-ficha-001',
      });

      expect(result.tier).toBe(1);
      expect(result.confidence).toBe(1.0);
      expect(result.game_id).toBe('game-catan-001');
      expect(result.match_method).toBe('barcode');
    });

    it('Tier 2: should match on historical SKU mapping memory with confidence 1.0', () => {
      const feedItem: FeedItem = {
        raw_title: 'Catan Edición Especial Devir',
        product_url: 'https://fichaydado.com/products/catan',
        price: 999,
        sku: 'SKU-CATAN-DEVIR',
      };

      const result = matchFeedItem(feedItem, {
        catalog: mockCatalog,
        barcodes: mockBarcodes,
        skuMappings: mockSkuMappings,
        storeId: 'store-ficha-001',
      });

      expect(result.tier).toBe(2);
      expect(result.confidence).toBe(1.0);
      expect(result.game_id).toBe('game-catan-001');
      expect(result.match_method).toBe('sku_memory');
    });

    it('Tier 3: should auto-publish high-confidence fuzzy match (score >= 0.92)', () => {
      const feedItem: FeedItem = {
        raw_title: 'Catan El Juego Base',
        product_url: 'https://rollgames.mx/products/catan',
        price: 950,
      };

      const result = matchFeedItem(feedItem, {
        catalog: mockCatalog,
        barcodes: mockBarcodes,
        skuMappings: mockSkuMappings,
        storeId: 'store-roll-001',
      });

      expect(result.tier).toBe(3);
      expect(result.confidence).toBeGreaterThanOrEqual(0.92);
      expect(result.game_id).toBe('game-catan-001');
      expect(result.match_method).toBe('fuzzy_composite');
    });

    it('Tier 4: should route ambiguous items to staging queue and provide candidate suggestions', () => {
      const feedItem: FeedItem = {
        raw_title: 'Catan Versión No Identificada',
        product_url: 'https://rollgames.mx/products/catan-unknown',
        price: 890,
      };

      const result = matchFeedItem(feedItem, {
        catalog: mockCatalog,
        barcodes: [],
        skuMappings: [],
        storeId: 'store-roll-001',
      });

      expect(result.tier).toBe(4);
      expect(result.match_method).toBe('manual_queue');
      expect(result.candidate_games?.length).toBeGreaterThan(0);
    });
  });
});
