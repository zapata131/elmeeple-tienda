import fs from 'fs';
import path from 'path';

export interface CachedGame {
  bgg_id: number;
  name: string;
  thumbnail: string;
  last_updated_at: string;
}

export interface CachedOffer {
  id: string;
  store_id: string;
  store_name: string;
  store_logo: string | null;
  store_country: string;
  rating: number;
  review_count: number;
  store_product_url: string;
  price: number;
  stock: number;
  edition_language: string;
  shipping_flat: number;
  shipping_free_threshold: number;
  is_featured: boolean;
  bgg_id: number;
}

export interface LocalCatalogCache {
  games: CachedGame[];
  offers: CachedOffer[];
  last_synced: string;
}

const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'crawled_catalog.json');

export function saveLocalCatalogCache(games: CachedGame[], offers: CachedOffer[]): boolean {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    const payload: LocalCatalogCache = {
      games,
      offers,
      last_synced: new Date().toISOString(),
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[LocalFileCache] Failed to write cache file:', err);
    return false;
  }
}

export function loadLocalCatalogCache(): LocalCatalogCache | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(raw) as LocalCatalogCache;
    }
  } catch (err) {
    console.error('[LocalFileCache] Failed to load cache file:', err);
  }
  return null;
}
