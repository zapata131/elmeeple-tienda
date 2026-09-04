import {
  Store,
  ShippingRate,
  CatalogGame,
  StoreOffer,
  CalculatedOffer,
  ClickRecord,
  EditionLanguage,
} from '../../types';
import {
  INITIAL_STORES,
  INITIAL_SHIPPING_RATES,
  INITIAL_GAMES,
  INITIAL_OFFERS,
} from './seed-data';
import { supabase } from '../supabase/client';

export class TabletopDatabase {
  private stores: Store[] = [...INITIAL_STORES];
  private shippingRates: ShippingRate[] = [...INITIAL_SHIPPING_RATES];
  private games: CatalogGame[] = [...INITIAL_GAMES];
  private offers: StoreOffer[] = [...INITIAL_OFFERS];

  async getStores(): Promise<Store[]> {
    try {
      const { data, error } = await supabase.from('stores').select('*');
      if (!error && data && data.length > 0) {
        return data as Store[];
      }
    } catch {}
    return this.stores;
  }

  async getShippingRates(): Promise<ShippingRate[]> {
    try {
      const { data, error } = await supabase.from('shipping_rates').select('*');
      if (!error && data && data.length > 0) {
        return data as ShippingRate[];
      }
    } catch {}
    return this.shippingRates;
  }

  async getCatalogGames(): Promise<CatalogGame[]> {
    try {
      const { data, error } = await supabase.from('catalog_games').select('*');
      if (!error && data && data.length > 0) {
        return data as CatalogGame[];
      }
    } catch {}
    return this.games;
  }

  async getGameBySlug(slug: string): Promise<CatalogGame | null> {
    try {
      const { data, error } = await supabase
        .from('catalog_games')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (!error && data) {
        return data as CatalogGame;
      }
    } catch {}
    const found = this.games.find(g => g.slug.toLowerCase() === slug.toLowerCase());
    return found || null;
  }

  async getOffersForGame(gameId: string): Promise<CalculatedOffer[]> {
    const stores = await this.getStores();

    let rawOffers: StoreOffer[] = [];
    try {
      const { data, error } = await supabase
        .from('store_offers')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true);
      if (!error && data && data.length > 0) {
        rawOffers = data as StoreOffer[];
      }
    } catch {}

    if (rawOffers.length === 0) {
      rawOffers = this.offers.filter(o => o.game_id === gameId && o.is_active);
    }

    const calculated: CalculatedOffer[] = [];

    for (const offer of rawOffers) {
      const store = stores.find(s => s.id === offer.store_id);
      if (!store) continue;

      calculated.push({
        ...offer,
        store,
        total_delivered_cost: offer.price,
        is_best_price: false,
      });
    }

    // Sort strictly by store item price (with featured store priority)
    calculated.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return a.price - b.price;
    });

    if (calculated.length > 0) {
      // Best price goes to lowest store price
      const lowest = [...calculated].sort((a, b) => a.price - b.price)[0];
      lowest.is_best_price = true;
    }

    return calculated;
  }

  async searchGames(query: string, language?: EditionLanguage | 'all'): Promise<CatalogGame[]> {
    const allGames = await this.getCatalogGames();
    if (!query || query.trim() === '') {
      return allGames;
    }

    const cleanQuery = query.toLowerCase().trim();
    const matches = allGames.filter(g => {
      const matchTitle = g.title.toLowerCase().includes(cleanQuery);
      const matchOriginal = g.original_title?.toLowerCase().includes(cleanQuery) || false;
      const matchAlts = g.alternate_titles.some(alt => alt.toLowerCase().includes(cleanQuery));
      return matchTitle || matchOriginal || matchAlts;
    });

    if (language && language !== 'all') {
      const matchingGameIds = new Set(
        this.offers
          .filter(o => o.edition_language === language && o.is_active)
          .map(o => o.game_id)
      );
      return matches.filter(g => matchingGameIds.has(g.id));
    }

    return matches;
  }

  async recordClick(click: ClickRecord): Promise<void> {
    try {
      await supabase.from('clicks').insert({
        offer_id: click.offer_id,
        store_id: click.store_id,
        destination_url: click.destination_url,
        user_agent: click.user_agent,
        ip_hash: click.ip_hash,
      });
    } catch {}
  }
}

export const db = new TabletopDatabase();
