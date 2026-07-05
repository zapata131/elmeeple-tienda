import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

export interface StoreMetadata {
  id?: string;
  name?: string;
  country?: string;
  base_url?: string;
}

export function filterDomesticOffers<T extends { store_id: string }>(
  offers: T[],
  storesMap: Record<string, StoreMetadata>,
  shippingCountry: string,
  domesticOnly: boolean
): T[] {
  if (!domesticOnly) {
    return offers;
  }

  const target = shippingCountry.toUpperCase();

  return offers.filter((offer) => {
    const store = storesMap[offer.store_id];
    if (!store) return false;

    if (store.country) {
      return store.country.toUpperCase() === target;
    }

    // Fallback detection from TLD
    const url = (store.base_url || '').toLowerCase();
    if (target === 'ES' && url.endsWith('.es')) return true;
    if (target === 'PT' && url.endsWith('.pt')) return true;
    if (target === 'MX' && url.endsWith('.mx')) return true;
    if (target === 'BR' && url.endsWith('.br')) return true;
    if (target === 'AR' && url.endsWith('.ar')) return true;
    if (target === 'CO' && url.endsWith('.co')) return true;
    if (target === 'CL' && url.endsWith('.cl')) return true;
    if (target === 'PE' && url.endsWith('.pe')) return true;

    return false;
  });
}

export async function seedMockData() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Regional Stores
  const storesToSeed = [
    { id: 'store-mx-01', name: 'Ficha y Dado', base_url: 'https://fichaydado.com', owner_email: 'contacto@fichaydado.com', verified: true, feed_status: 'success' },
    { id: 'store-mx-02', name: 'Mundo Meeple Store', base_url: 'https://mundomeeplestore.com', owner_email: 'contacto@mundomeeplestore.com', verified: true, feed_status: 'success' },
    { id: 'store-mx-03', name: 'Roll Games', base_url: 'https://rollgames.mx', owner_email: 'info@rollgames.mx', verified: true, feed_status: 'success' },
    { id: 'store-mx-04', name: 'Con T de Tlacuache', base_url: 'https://tdetlacuache.com', owner_email: 'ventas@tdetlacuache.com', verified: true, feed_status: 'success' },
    { id: 'store-mx-05', name: 'Geeky Stuff', base_url: 'https://www.geekystuff.mx', owner_email: 'hola@geekystuff.mx', verified: true, feed_status: 'success' },
    { id: 'store-mx-06', name: 'Quantum Boardgames', base_url: 'https://quantumboardgames.com', owner_email: 'info@quantumboardgames.com', verified: true, feed_status: 'success' },
    { id: 'store-mx-07', name: 'Alfa y Delta', base_url: 'https://alfaydelta.com', owner_email: 'contacto@alfaydelta.com', verified: true, feed_status: 'success' },
    { id: 'store-mx-08', name: 'Bundaba', base_url: 'https://bundaba.com.mx', owner_email: 'hola@bundaba.com.mx', verified: true, feed_status: 'success' },
  ];

  await supabase.from('stores').upsert(storesToSeed, { onConflict: 'id' });

  // 2. 22 Acclaimed Board Games with real BGG cover thumbnails
  const gamesToSeed = [
    { bgg_id: 13, name: 'Catan', thumbnail: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__thumb/img/8a9HeqFydO7Uun_le9bXWPnidcA=/fit-in/200x150/filters:strip_icc()/pic2419375.jpg', weight: 2.30, min_players: 3, max_players: 4, playing_time: 120, categories: ['Negociación', 'Familiar'], ean: '8435407600011' },
    { bgg_id: 822, name: 'Carcassonne', thumbnail: 'https://cf.geekdo-images.com/okM0dq_bEXnbyQTOvHfwRA__thumb/img/h7VbA4i4qM2H9q5913eP2v0MvGE=/fit-in/200x150/filters:strip_icc()/pic6544250.png', weight: 1.90, min_players: 2, max_players: 5, playing_time: 45, categories: ['Colocación de Losetas', 'Familiar'], ean: '8435407600028' },
    { bgg_id: 30549, name: 'Pandemic', thumbnail: 'https://cf.geekdo-images.com/S3ybV1LAp-8SnHIXLLjVbg__thumb/img/lT0Zt2VwWl2j2k6M_yXk1t4JvA0=/fit-in/200x150/filters:strip_icc()/pic1534148.jpg', weight: 2.41, min_players: 2, max_players: 4, playing_time: 45, categories: ['Cooperativo', 'Estrategia'], ean: '8435407600035' },
    { bgg_id: 68448, name: '7 Wonders', thumbnail: 'https://cf.geekdo-images.com/RvVWTr4XXlA6kS8P6fXNCA__thumb/img/4j3Hk8sF2R9v1M7g3t5y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic5626205.jpg', weight: 2.32, min_players: 3, max_players: 7, playing_time: 30, categories: ['Drafting', 'Civilización'], ean: '8435407600042' },
    { bgg_id: 148228, name: 'Splendor', thumbnail: 'https://cf.geekdo-images.com/rwOMxx4q5yuElIv-Bgq4PA__thumb/img/7n3k9g1H8v5M2X6t4y0D5A=/fit-in/200x150/filters:strip_icc()/pic1904079.jpg', weight: 1.78, min_players: 2, max_players: 4, playing_time: 30, categories: ['Construcción de Motor', 'Familiar'], ean: '8435407600059' },
    { bgg_id: 167791, name: 'Terraforming Mars', thumbnail: 'https://cf.geekdo-images.com/wg9oOLcsKvDesSUdJEClzg__thumb/img/H-9v8t6R2K1M7g3t5y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic3536616.jpg', weight: 3.25, min_players: 1, max_players: 5, playing_time: 120, categories: ['Estrategia', 'Ciencia Ficción'], ean: '8435407600066' },
    { bgg_id: 169786, name: 'Scythe', thumbnail: 'https://cf.geekdo-images.com/7k_nOxpO9OGi0hbdICzfAw__thumb/img/9n2K7g8H3v1M6t5y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic3163924.jpg', weight: 3.44, min_players: 1, max_players: 5, playing_time: 115, categories: ['Estrategia', 'Eurogame'], ean: '8435407600073' },
    { bgg_id: 266192, name: 'Wingspan', thumbnail: 'https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__thumb/img/8k3g9h2H1v5M4t7y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic4458123.jpg', weight: 2.46, min_players: 1, max_players: 5, playing_time: 70, categories: ['Colección', 'Naturaleza'], ean: '8435407600080' },
    { bgg_id: 224517, name: 'Brass: Birmingham', thumbnail: 'https://cf.geekdo-images.com/x3zxjr-Vw5iU4yDPg70Jgw__thumb/img/6m2k8g9H4v1M3X7t5y0D5A=/fit-in/200x150/filters:strip_icc()/pic3490053.jpg', weight: 3.88, min_players: 2, max_players: 4, playing_time: 120, categories: ['Económico', 'Euro Avanzado'], ean: '8435407600097' },
    { bgg_id: 342942, name: 'Ark Nova', thumbnail: 'https://cf.geekdo-images.com/so66Niv-aI4y4L2q4O2y7g__thumb/img/5k2h8g1H7v3M9t6y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic6294321.jpg', weight: 3.73, min_players: 1, max_players: 4, playing_time: 150, categories: ['Gestión de Zoológico', 'Euro Avanzado'], ean: '8435407600103' },
    { bgg_id: 316554, name: 'Dune: Imperium', thumbnail: 'https://cf.geekdo-images.com/6g9q8n7H2v4M1t5y0JvD5A__thumb/img/3k1h7g9H6v2M8t4y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic5695333.jpg', weight: 3.04, min_players: 1, max_players: 4, playing_time: 120, categories: ['Construcción de Mazo', 'Trabajadores'], ean: '8435407600110' },
    { bgg_id: 295947, name: 'Cascadia', thumbnail: 'https://cf.geekdo-images.com/8k1g7h9H3v5M2t6y0JvD5A__thumb/img/2k9h8g7H1v4M5t3y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic5100691.jpg', weight: 1.85, min_players: 1, max_players: 4, playing_time: 45, categories: ['Colocación de Losetas', 'Naturaleza'], ean: '8435407600127' },
    { bgg_id: 199792, name: 'Everdell', thumbnail: 'https://cf.geekdo-images.com/9k2h8g7H4v1M6t5y0JvD5A__thumb/img/1k8h7g9H3v2M4t6y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic3918905.png', weight: 2.81, min_players: 1, max_players: 4, playing_time: 80, categories: ['Colocación de Trabajadores', 'Fantasía'], ean: '8435407600134' },
    { bgg_id: 230802, name: 'Azul', thumbnail: 'https://cf.geekdo-images.com/7k1h9g8H2v5M3t6y0JvD5A__thumb/img/4k7h8g9H1v3M2t5y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic3718275.jpg', weight: 1.76, min_players: 2, max_players: 4, playing_time: 45, categories: ['Abstracto', 'Familiar'], ean: '8435407600141' },
    { bgg_id: 237182, name: 'Root', thumbnail: 'https://cf.geekdo-images.com/5k8h7g9H1v2M4t6y0JvD5A__thumb/img/6k9h8g7H3v1M5t4y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic4254509.jpg', weight: 3.80, min_players: 2, max_players: 4, playing_time: 90, categories: ['Asimétrico', 'Guerra'], ean: '8435407600158' },
    { bgg_id: 174430, name: 'Gloomhaven', thumbnail: 'https://cf.geekdo-images.com/3k9h8g7H2v1M5t4y0JvD5A__thumb/img/8k7h9g1H4v3M2t6y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic2437871.jpg', weight: 3.89, min_players: 1, max_players: 4, playing_time: 120, categories: ['Dungeon Crawler', 'Campaña'], ean: '8435407600165' },
    { bgg_id: 162886, name: 'Spirit Island', thumbnail: 'https://cf.geekdo-images.com/2k8h9g7H1v4M5t3y0JvD5A__thumb/img/9k1h8g7H2v5M4t6y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic3550672.jpg', weight: 4.06, min_players: 1, max_players: 4, playing_time: 120, categories: ['Cooperativo Asimétrico', 'Estrategia'], ean: '8435407600172' },
    { bgg_id: 183394, name: 'Viticulture Essential Edition', thumbnail: 'https://cf.geekdo-images.com/1k7h8g9H3v2M4t5y0JvD5A__thumb/img/3k8h9g7H1v5M2t6y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic2692181.jpg', weight: 2.89, min_players: 1, max_players: 6, playing_time: 90, categories: ['Gestión de Viñedo', 'Trabajadores'], ean: '8435407600189' },
    { bgg_id: 312484, name: 'Lost Ruins of Arnak', thumbnail: 'https://cf.geekdo-images.com/4k8h7g9H2v1M5t3y0JvD5A__thumb/img/2k7h9g8H1v4M6t5y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic5666597.jpg', weight: 2.92, min_players: 1, max_players: 4, playing_time: 120, categories: ['Exploración', 'Construcción de Mazo'], ean: '8435407600196' },
    { bgg_id: 366013, name: 'Heat: Pedal to the Metal', thumbnail: 'https://cf.geekdo-images.com/9k1h8g7H3v5M2t4y0JvD5A__thumb/img/7k8h9g1H4v2M5t6y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic6926071.jpg', weight: 2.21, min_players: 1, max_players: 6, playing_time: 60, categories: ['Carreras', 'Gestión de Mano'], ean: '8435407600202' },
    { bgg_id: 414317, name: 'Harmonies', thumbnail: 'https://cf.geekdo-images.com/8k7h9g1H2v4M5t3y0JvD5A__thumb/img/1k9h8g7H3v5M2t4y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic8073521.png', weight: 1.80, min_players: 1, max_players: 4, playing_time: 30, categories: ['Colocación de Fichas', 'Naturaleza'], ean: '8435407600219' },
    { bgg_id: 391163, name: 'Forest Shuffle', thumbnail: 'https://cf.geekdo-images.com/5k7h8g9H1v3M2t4y0JvD5A__thumb/img/6k8h9g7H2v4M5t3y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic7541291.jpg', weight: 2.15, min_players: 2, max_players: 5, playing_time: 60, categories: ['Cartas', 'Bosque'], ean: '8435407600226' },
  ];

  await supabase.from('bgg_games_cache').upsert(
    gamesToSeed.map((g) => ({ ...g, last_updated_at: new Date().toISOString() })),
    { onConflict: 'bgg_id' }
  );

  // 3. Store Game Offers across stores
  const offersToSeed: Array<{ store_id: string; bgg_id: number; price: number; stock: number; store_product_url: string; edition_language: string; last_updated_at: string }> = [];
  const now = new Date().toISOString();

  for (const st of storesToSeed) {
    for (const g of gamesToSeed) {
      // 85% probability that each store carries each game
      if (Math.random() < 0.85 || g.bgg_id === 13 || g.bgg_id === 167791 || g.bgg_id === 266192) {
        const basePrice = g.weight > 3.5 ? 69.95 : g.weight > 2.5 ? 49.95 : 34.95;
        const variance = (Math.random() * 12 - 6);
        const price = Number(Math.max(15.95, basePrice + variance).toFixed(2));
        offersToSeed.push({
          store_id: st.id,
          bgg_id: g.bgg_id,
          price,
          stock: Math.floor(Math.random() * 12) + 1,
          store_product_url: `${st.base_url}/game-${g.bgg_id}`,
          edition_language: st.base_url.endsWith('.pt') || st.base_url.endsWith('.br') ? 'pt' : 'es',
          last_updated_at: now,
        });
      }
    }
  }

  await supabase.from('store_games').upsert(offersToSeed, { onConflict: 'store_id,bgg_id' });

  // 4. Shipping Rates across destinations
  const shippingToSeed = [
    { store_id: '11111111-1111-1111-1111-111111111101', destination_country: 'ES', flat_rate: 4.99, free_shipping_threshold: 45.0 },
    { store_id: '11111111-1111-1111-1111-111111111102', destination_country: 'ES', flat_rate: 3.99, free_shipping_threshold: 50.0 },
    { store_id: '11111111-1111-1111-1111-111111111103', destination_country: 'ES', flat_rate: 5.50, free_shipping_threshold: 40.0 },
    { store_id: '11111111-1111-1111-1111-111111111104', destination_country: 'PT', flat_rate: 4.50, free_shipping_threshold: 35.0 },
    { store_id: '11111111-1111-1111-1111-111111111104', destination_country: 'ES', flat_rate: 6.99, free_shipping_threshold: 60.0 },
    { store_id: '11111111-1111-1111-1111-111111111106', destination_country: 'MX', flat_rate: 5.00, free_shipping_threshold: 50.0 },
    { store_id: '11111111-1111-1111-1111-111111111108', destination_country: 'BR', flat_rate: 4.00, free_shipping_threshold: 45.0 },
    { store_id: '11111111-1111-1111-1111-111111111110', destination_country: 'AR', flat_rate: 5.00, free_shipping_threshold: 40.0 },
    { store_id: '11111111-1111-1111-1111-111111111111', destination_country: 'CO', flat_rate: 4.50, free_shipping_threshold: 40.0 },
    { store_id: '11111111-1111-1111-1111-111111111112', destination_country: 'CL', flat_rate: 5.00, free_shipping_threshold: 45.0 },
    { store_id: '11111111-1111-1111-1111-111111111113', destination_country: 'PE', flat_rate: 4.50, free_shipping_threshold: 40.0 },
  ];

  await supabase.from('shipping_rates').upsert(shippingToSeed, { onConflict: 'store_id,destination_country' });

  return {
    storesCount: storesToSeed.length,
    gamesCount: gamesToSeed.length,
    offersCount: offersToSeed.length,
    shippingCount: shippingToSeed.length,
  };
}
