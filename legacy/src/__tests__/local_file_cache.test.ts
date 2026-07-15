import fs from 'fs';
import path from 'path';
import { saveLocalCatalogCache, loadLocalCatalogCache, CachedGame, CachedOffer } from '@/utils/local_file_cache';

describe('US-88: Zero-Docker Local Filesystem Catalog Cache', () => {
  const testCacheDir = path.join(process.cwd(), '.cache');
  const testCacheFile = path.join(testCacheDir, 'crawled_catalog.json');

  const sampleGames: CachedGame[] = [
    { bgg_id: 421285, name: 'Excalibur', thumbnail: 'https://mock.jpg', last_updated_at: '2026-07-05T12:00:00Z' },
  ];

  const sampleOffers: CachedOffer[] = [
    {
      id: 'offer-1',
      store_id: '11111111-1111-1111-1111-111111111104',
      store_name: 'Con T de Tlacuache',
      store_logo: null,
      store_country: 'MX',
      rating: 4.9,
      review_count: 500,
      store_product_url: 'https://tdetlacuache.com/products/excalibur',
      price: 950.00,
      stock: 5,
      edition_language: 'es',
      shipping_flat: 99.0,
      shipping_free_threshold: 1200.0,
      is_featured: false,
      bgg_id: 421285,
    },
  ];

  afterAll(() => {
    if (fs.existsSync(testCacheFile)) {
      fs.unlinkSync(testCacheFile);
    }
  });

  it('saves crawled catalog items to local filesystem JSON and retrieves them correctly', () => {
    const saved = saveLocalCatalogCache(sampleGames, sampleOffers);
    expect(saved).toBe(true);
    expect(fs.existsSync(testCacheFile)).toBe(true);

    const loaded = loadLocalCatalogCache();
    expect(loaded).toBeDefined();
    expect(loaded?.games).toHaveLength(1);
    expect(loaded?.games[0].name).toBe('Excalibur');
    expect(loaded?.offers).toHaveLength(1);
    expect(loaded?.offers[0].price).toBe(950.00);
  });
});
