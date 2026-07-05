export interface MockStore {
  id: string;
  name: string;
  country: string; // ES, PT, MX, BR, AR, CO, CL, PE, UY
  logo_url: string | null;
  rating: number;
  review_count: number;
  website: string;
  default_shipping_flat: number;
  free_shipping_threshold: number | null;
}

export interface MockGame {
  bgg_id: number;
  name: string;
  thumbnail: string;
  weight: number;
  min_players: number;
  max_players: number;
  playing_time: number;
  base_price_eur: number; // Base price reference in EUR equivalent
}

export const MOCK_IBEROAMERICAN_STORES: MockStore[] = [
  // España (ES) - Península Ibérica
  {
    id: 'store-es-01',
    name: 'Zygomatic España',
    country: 'ES',
    logo_url: null,
    rating: 4.9,
    review_count: 340,
    website: 'https://zygomatic.es',
    default_shipping_flat: 3.99,
    free_shipping_threshold: 50.0,
  },
  {
    id: 'store-es-02',
    name: 'Jugamos Una',
    country: 'ES',
    logo_url: null,
    rating: 4.8,
    review_count: 512,
    website: 'https://jugamosuna.es',
    default_shipping_flat: 4.50,
    free_shipping_threshold: 45.0,
  },
  {
    id: 'store-es-03',
    name: 'Zacatraza Juegos',
    country: 'ES',
    logo_url: null,
    rating: 4.9,
    review_count: 890,
    website: 'https://zacatrus.es',
    default_shipping_flat: 3.50,
    free_shipping_threshold: 40.0,
  },
  {
    id: 'store-es-04',
    name: 'Cuarto de Juegos Madrid',
    country: 'ES',
    logo_url: null,
    rating: 4.7,
    review_count: 210,
    website: 'https://cuartodejuegos.es',
    default_shipping_flat: 4.99,
    free_shipping_threshold: 60.0,
  },
  {
    id: 'store-es-05',
    name: 'Mathom Tienda',
    country: 'ES',
    logo_url: null,
    rating: 4.8,
    review_count: 175,
    website: 'https://mathom.es',
    default_shipping_flat: 4.20,
    free_shipping_threshold: 55.0,
  },
  {
    id: 'store-es-06',
    name: 'Planetongames Barcelona',
    country: 'ES',
    logo_url: null,
    rating: 4.9,
    review_count: 620,
    website: 'https://planetongames.com',
    default_shipping_flat: 3.95,
    free_shipping_threshold: 49.0,
  },
  {
    id: 'store-es-07',
    name: 'Dracotienda',
    country: 'ES',
    logo_url: null,
    rating: 4.6,
    review_count: 310,
    website: 'https://dracotienda.com',
    default_shipping_flat: 5.00,
    free_shipping_threshold: 65.0,
  },

  // Portugal (PT) - Península Ibérica
  {
    id: 'store-pt-08',
    name: 'Ludopolis Portugal',
    country: 'PT',
    logo_url: null,
    rating: 4.8,
    review_count: 190,
    website: 'https://ludopolis.pt',
    default_shipping_flat: 4.50,
    free_shipping_threshold: 50.0,
  },
  {
    id: 'store-pt-09',
    name: 'Gameplay PT Porto',
    country: 'PT',
    logo_url: null,
    rating: 4.7,
    review_count: 125,
    website: 'https://gameplay.pt',
    default_shipping_flat: 4.90,
    free_shipping_threshold: 55.0,
  },
  {
    id: 'store-pt-10',
    name: 'A Jogar PT Lisboa',
    country: 'PT',
    logo_url: null,
    rating: 4.9,
    review_count: 240,
    website: 'https://ajogar.pt',
    default_shipping_flat: 3.99,
    free_shipping_threshold: 45.0,
  },

  // México (MX) - Iberoamérica
  {
    id: 'store-mx-11',
    name: 'El Duende Juegos CDMX',
    country: 'MX',
    logo_url: null,
    rating: 4.9,
    review_count: 420,
    website: 'https://elduende.mx',
    default_shipping_flat: 5.50,
    free_shipping_threshold: 55.0,
  },
  {
    id: 'store-mx-12',
    name: 'La Madriguera GDL',
    country: 'MX',
    logo_url: null,
    rating: 4.8,
    review_count: 280,
    website: 'https://lamadriguera.mx',
    default_shipping_flat: 6.00,
    free_shipping_threshold: 60.0,
  },
  {
    id: 'store-mx-13',
    name: 'Orcs Stories Board Games',
    country: 'MX',
    logo_url: null,
    rating: 4.9,
    review_count: 510,
    website: 'https://orcsstories.mx',
    default_shipping_flat: 4.99,
    free_shipping_threshold: 50.0,
  },
  {
    id: 'store-mx-14',
    name: 'El Reino Monterrey',
    country: 'MX',
    logo_url: null,
    rating: 4.7,
    review_count: 195,
    website: 'https://elreinojuegos.mx',
    default_shipping_flat: 5.80,
    free_shipping_threshold: 58.0,
  },

  // Brasil (BR) - Iberoamérica
  {
    id: 'store-br-15',
    name: 'Ludofy Brasil São Paulo',
    country: 'BR',
    logo_url: null,
    rating: 4.9,
    review_count: 670,
    website: 'https://ludofy.com.br',
    default_shipping_flat: 6.50,
    free_shipping_threshold: 65.0,
  },
  {
    id: 'store-br-16',
    name: 'Galápagos Jogos Rio',
    country: 'BR',
    logo_url: null,
    rating: 4.8,
    review_count: 810,
    website: 'https://mundogalapagos.com.br',
    default_shipping_flat: 5.90,
    free_shipping_threshold: 60.0,
  },
  {
    id: 'store-br-17',
    name: 'Bucaneiros Jogos',
    country: 'BR',
    logo_url: null,
    rating: 4.7,
    review_count: 320,
    website: 'https://bucaneirosjogos.com.br',
    default_shipping_flat: 7.00,
    free_shipping_threshold: 70.0,
  },

  // Argentina (AR) - Iberoamérica
  {
    id: 'store-ar-18',
    name: 'Bureau de Juegos BsAs',
    country: 'AR',
    logo_url: null,
    rating: 4.8,
    review_count: 450,
    website: 'https://bureaudejuegos.com.ar',
    default_shipping_flat: 5.00,
    free_shipping_threshold: 50.0,
  },
  {
    id: 'store-ar-19',
    name: 'La BSK Argentina',
    country: 'AR',
    logo_url: null,
    rating: 4.7,
    review_count: 230,
    website: 'https://labsk.com.ar',
    default_shipping_flat: 5.50,
    free_shipping_threshold: 55.0,
  },

  // Colombia (CO) - Iberoamérica
  {
    id: 'store-co-20',
    name: 'Azahar Juegos Bogotá',
    country: 'CO',
    logo_url: null,
    rating: 4.9,
    review_count: 310,
    website: 'https://azaharjuegos.co',
    default_shipping_flat: 5.20,
    free_shipping_threshold: 52.0,
  },

  // Chile (CL) - Iberoamérica
  {
    id: 'store-cl-21',
    name: 'Devir Chile Santiago',
    country: 'CL',
    logo_url: null,
    rating: 4.9,
    review_count: 590,
    website: 'https://devir.cl',
    default_shipping_flat: 5.00,
    free_shipping_threshold: 50.0,
  },

  // Perú (PE) - Iberoamérica
  {
    id: 'store-pe-22',
    name: 'Dado de la Paz Lima',
    country: 'PE',
    logo_url: null,
    rating: 4.8,
    review_count: 180,
    website: 'https://dadodelapaz.pe',
    default_shipping_flat: 5.50,
    free_shipping_threshold: 55.0,
  }
];

export const MOCK_GAMES: MockGame[] = [
  {
    bgg_id: 13,
    name: 'Catan',
    thumbnail: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__thumb/img/8a9HeqFydO7Uun_le9bXWPnidcA=/fit-in/200x150/filters:strip_icc()/pic2419375.jpg',
    weight: 2.3,
    min_players: 3,
    max_players: 4,
    playing_time: 120,
    base_price_eur: 37.50,
  },
  {
    bgg_id: 266192,
    name: 'Wingspan',
    thumbnail: 'https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__thumb/img/s3k1Kj9jMv2V8EaU3Rk8oJ5P2mU=/fit-in/200x150/filters:strip_icc()/pic4458123.jpg',
    weight: 2.46,
    min_players: 1,
    max_players: 5,
    playing_time: 70,
    base_price_eur: 49.90,
  },
  {
    bgg_id: 167791,
    name: 'Terraforming Mars',
    thumbnail: 'https://cf.geekdo-images.com/wg9oOLcsKvDesSUdZQ4rxw__thumb/img/8o5Gv9aP1bH9aU9s_WJz4Vb_a2c=/fit-in/200x150/filters:strip_icc()/pic3536616.jpg',
    weight: 3.24,
    min_players: 1,
    max_players: 5,
    playing_time: 120,
    base_price_eur: 54.95,
  },
  {
    bgg_id: 169786,
    name: 'Scythe',
    thumbnail: 'https://cf.geekdo-images.com/7k_nOxpO9e45llwI411nkw__thumb/img/G1s_Z_44498k2K_s85sL63E8k7s=/fit-in/200x150/filters:strip_icc()/pic3163924.jpg',
    weight: 3.44,
    min_players: 1,
    max_players: 5,
    playing_time: 115,
    base_price_eur: 69.90,
  },
  {
    bgg_id: 342942,
    name: 'Ark Nova',
    thumbnail: 'https://cf.geekdo-images.com/so6c-DqB_s4e_X1_W17K_g__thumb/img/v4c9E_q_y_z_T7j_310_e62k_a4=/fit-in/200x150/filters:strip_icc()/pic6293412.jpg',
    weight: 3.76,
    min_players: 1,
    max_players: 4,
    playing_time: 150,
    base_price_eur: 62.50,
  },
  {
    bgg_id: 295947,
    name: 'Cascadia',
    thumbnail: 'https://cf.geekdo-images.com/MjeJZfulbsM1DSV3DrLjYA__thumb/img/C3a_8_e_k_9z_7E_320_e62k_a4=/fit-in/200x150/filters:strip_icc()/pic5100691.jpg',
    weight: 1.95,
    min_players: 1,
    max_players: 4,
    playing_time: 45,
    base_price_eur: 34.90,
  },
  {
    bgg_id: 224517,
    name: 'Brass: Birmingham',
    thumbnail: 'https://cf.geekdo-images.com/x3zxjr-Vw5iU4yDPg70Jgw__thumb/img/8u9a_b_c_d_e_f_g_h_i_j_k_l=/fit-in/200x150/filters:strip_icc()/pic3490053.jpg',
    weight: 3.89,
    min_players: 2,
    max_players: 4,
    playing_time: 120,
    base_price_eur: 64.90,
  },
  {
    bgg_id: 316554,
    name: 'Dune: Imperium',
    thumbnail: 'https://cf.geekdo-images.com/QePqK_A_4_d_B_A_C_D_E_F_G=/fit-in/200x150/filters:strip_icc()/pic5696895.jpg',
    weight: 3.04,
    min_players: 1,
    max_players: 4,
    playing_time: 120,
    base_price_eur: 48.50,
  },
  {
    bgg_id: 173346,
    name: '7 Wonders Duel',
    thumbnail: 'https://cf.geekdo-images.com/WzWzWzWzWzWzWzWzWzWzWz=/fit-in/200x150/filters:strip_icc()/pic2576399.jpg',
    weight: 2.24,
    min_players: 2,
    max_players: 2,
    playing_time: 30,
    base_price_eur: 24.90,
  },
  {
    bgg_id: 230802,
    name: 'Azul',
    thumbnail: 'https://cf.geekdo-images.com/tz19y19y19y19y19y19y19=/fit-in/200x150/filters:strip_icc()/pic3718275.jpg',
    weight: 1.76,
    min_players: 2,
    max_players: 4,
    playing_time: 45,
    base_price_eur: 39.90,
  },
  {
    bgg_id: 237182,
    name: 'Root',
    thumbnail: 'https://cf.geekdo-images.com/root_thumb.jpg',
    weight: 3.78,
    min_players: 2,
    max_players: 4,
    playing_time: 90,
    base_price_eur: 58.00,
  },
  {
    bgg_id: 822,
    name: 'Carcassonne',
    thumbnail: 'https://cf.geekdo-images.com/carc_thumb.jpg',
    weight: 1.90,
    min_players: 2,
    max_players: 5,
    playing_time: 45,
    base_price_eur: 29.90,
  }
];

export function getMockOffersForGame(bggId: number, countryCode: string) {
  const game = MOCK_GAMES.find((g) => g.bgg_id === bggId) || MOCK_GAMES[0];

  // Pick 6 to 8 regional stores based on game ID to ensure rich variety
  return MOCK_IBEROAMERICAN_STORES.slice(0, 12).map((store, idx) => {
    // Generate slight price variance (+/- 15%) around base_price_eur
    const priceVariance = ((idx % 5) - 2) * 1.5;
    const basePrice = Math.max(15.0, Number((game.base_price_eur + priceVariance).toFixed(2)));

    const isDomestic = store.country.toUpperCase() === countryCode.toUpperCase();
    // Domestic shipping flat rate or regional flat rate
    const shipping_flat = isDomestic ? store.default_shipping_flat : store.default_shipping_flat + 8.00;
    const shipping_free_threshold = isDomestic ? store.free_shipping_threshold : null;

    // Language edition based on store country
    const edition_language = store.country === 'BR' || store.country === 'PT' ? 'pt' : 'es';

    // Stock availability: most in stock, every 5th item out of stock to test alerts
    const stock = idx === 4 ? 0 : (idx + 1) * 3;

    return {
      id: `offer-${bggId}-${store.id}`,
      store_id: store.id,
      store_name: store.name,
      store_logo: store.logo_url,
      store_country: store.country,
      rating: store.rating,
      review_count: store.review_count,
      store_product_url: store.website,
      price: basePrice,
      stock,
      edition_language,
      shipping_flat,
      shipping_free_threshold,
      is_featured: idx === 0,
    };
  });
}
