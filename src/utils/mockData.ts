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
  image?: string;
  description?: string;
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

  // México (MX) - Tiendas Oficiales Verificadas
  {
    id: 'store-mx-01',
    name: 'El Duende Juegos CDMX',
    country: 'MX',
    logo_url: null,
    rating: 4.9,
    review_count: 540,
    website: 'https://elduende.mx',
    default_shipping_flat: 99.0,
    free_shipping_threshold: 1200.0,
  },
  {
    id: 'store-mx-02',
    name: 'La Caravana Gamelab',
    country: 'MX',
    logo_url: null,
    rating: 4.8,
    review_count: 680,
    website: 'https://lacaravanagamelab.com',
    default_shipping_flat: 120.0,
    free_shipping_threshold: 1500.0,
  },
  {
    id: 'store-mx-03',
    name: 'Dungeoneers México',
    country: 'MX',
    logo_url: null,
    rating: 4.9,
    review_count: 410,
    website: 'https://dungeoneers.mx',
    default_shipping_flat: 110.0,
    free_shipping_threshold: 999.0,
  },
  {
    id: 'store-mx-04',
    name: 'Devir México Tienda Oficial',
    country: 'MX',
    logo_url: null,
    rating: 4.7,
    review_count: 320,
    website: 'https://devir.mx',
    default_shipping_flat: 89.0,
    free_shipping_threshold: 800.0,
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
    thumbnail: 'https://cf.geekdo-images.com/0XODRpReiZBFUffEcqT5-Q__small/img/SNVfF23OQafv3u8xdFolJnMkBoM=/fit-in/200x150/filters:strip_icc()/pic9156909.png',
    image: 'https://cf.geekdo-images.com/0XODRpReiZBFUffEcqT5-Q__original/img/oRc0AomWA9ZtFqQDZiZbIyKE1j0=/0x0/filters:format(png)/pic9156909.png',
    description: 'En Catan, los jugadores intentan ser la fuerza dominante en la isla construyendo colonias, ciudades y carreteras mediante el comercio de recursos como lana, cereales, madera, ladrillo y mineral.',
    weight: 2.3,
    min_players: 3,
    max_players: 4,
    playing_time: 120,
    base_price_eur: 37.50,
  },
  {
    bgg_id: 266192,
    name: 'Wingspan',
    thumbnail: 'https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__small/img/VNToqgS2-pOGU6MuvIkMPKn_y-s=/fit-in/200x150/filters:strip_icc()/pic4458123.jpg',
    image: 'https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__original/img/cI782Zis9cT66j2MjSHKJGnFPNw=/0x0/filters:format(jpeg)/pic4458123.jpg',
    description: 'Eres un entusiasta de las aves: investigador, observador de aves, ornitólogo o coleccionista que busca atraer las mejores y más hermosas especies a su red de reservas naturales.',
    weight: 2.46,
    min_players: 1,
    max_players: 5,
    playing_time: 70,
    base_price_eur: 49.90,
  },
  {
    bgg_id: 167791,
    name: 'Terraforming Mars',
    thumbnail: 'https://cf.geekdo-images.com/wg9oOLcsKvDesSUdZQ4rxw__small/img/BTxqxgYay5tHJfVoJ2NF5g43_gA=/fit-in/200x150/filters:strip_icc()/pic3536616.jpg',
    image: 'https://cf.geekdo-images.com/wg9oOLcsKvDesSUdZQ4rxw__original/img/thIqWDnH9utKuoKVEUqveDixprI=/0x0/filters:format(jpeg)/pic3536616.jpg',
    description: 'En el siglo XXIV, la humanidad comienza a terraformar el planeta Marte. Corporaciones gigantes lideradas por el Gobierno Mundial invierten recursos para elevar la temperatura, el oxígeno y los océanos.',
    weight: 3.24,
    min_players: 1,
    max_players: 5,
    playing_time: 120,
    base_price_eur: 54.95,
  },
  {
    bgg_id: 169786,
    name: 'Scythe',
    thumbnail: 'https://cf.geekdo-images.com/7k_nOxpO9OGIjhLq2BUZdA__small/img/eQ69OEDdjYjfKg6q5Navee87skU=/fit-in/200x150/filters:strip_icc()/pic3163924.jpg',
    image: 'https://cf.geekdo-images.com/7k_nOxpO9OGIjhLq2BUZdA__original/img/HlDb9F365w0tSP8uD1vf1pfniQE=/0x0/filters:format(jpeg)/pic3163924.jpg',
    description: 'Scythe es un juego de construcción de motores de estrategia ambientado en una historia alternativa en la Europa de los años 1920 tras la Gran Guerra.',
    weight: 3.44,
    min_players: 1,
    max_players: 5,
    playing_time: 115,
    base_price_eur: 69.90,
  },
  {
    bgg_id: 342942,
    name: 'Ark Nova',
    thumbnail: 'https://cf.geekdo-images.com/SoU8p28Sk1s8MSvoM4N8pQ__small/img/4KuHNTWSMPf8vTNDKSRMMI3oOv8=/fit-in/200x150/filters:strip_icc()/pic6293412.jpg',
    image: 'https://cf.geekdo-images.com/SoU8p28Sk1s8MSvoM4N8pQ__original/img/g4S18szTdrXCdIwVKzMKrZrYAcM=/0x0/filters:format(jpeg)/pic6293412.jpg',
    description: 'En Ark Nova planificarás y diseñarás un zoológico científicamente administrado con las instalaciones más avanzadas y proyectos de conservación global.',
    weight: 3.76,
    min_players: 1,
    max_players: 4,
    playing_time: 150,
    base_price_eur: 62.50,
  },
  {
    bgg_id: 295947,
    name: 'Cascadia',
    thumbnail: 'https://cf.geekdo-images.com/MjeJZfulbsM1DSV3DrGJYA__small/img/tVSFjSxYEcw7sKj3unIIQV8kxoc=/fit-in/200x150/filters:strip_icc()/pic5100691.jpg',
    image: 'https://cf.geekdo-images.com/MjeJZfulbsM1DSV3DrGJYA__original/img/B374C04Eip7fmQBGJzgiOTp-jyQ=/0x0/filters:format(jpeg)/pic5100691.jpg',
    description: 'Cascadia es un juego de colocación de losetas y selección de fichas que presenta los hábitats y la vida silvestre del noroeste del Pacífico.',
    weight: 1.95,
    min_players: 1,
    max_players: 4,
    playing_time: 45,
    base_price_eur: 34.90,
  },
  {
    bgg_id: 224517,
    name: 'Brass: Birmingham',
    thumbnail: 'https://cf.geekdo-images.com/x3zxjr-Vw5iU4yDPg70Jgw__small/img/o18rjEemoWaVru9Y2TyPwuIaRfE=/fit-in/200x150/filters:strip_icc()/pic3490053.jpg',
    image: 'https://cf.geekdo-images.com/x3zxjr-Vw5iU4yDPg70Jgw__original/img/FpyxH41Y6_ROoePAilPNEhXnzO8=/0x0/filters:format(jpeg)/pic3490053.jpg',
    description: 'Brass: Birmingham es un juego de estrategia económica que cuenta la historia de emprendedores que compiten en Birmingham durante la revolución industrial.',
    weight: 3.89,
    min_players: 2,
    max_players: 4,
    playing_time: 120,
    base_price_eur: 64.90,
  },
  {
    bgg_id: 316554,
    name: 'Dune: Imperium',
    thumbnail: 'https://cf.geekdo-images.com/PhjygpWSo-0labGrPBMyyg__small/img/JGgY-nBmkyB8WRp8vcoBLlNMQ5U=/fit-in/200x150/filters:strip_icc()/pic5666597.jpg',
    image: 'https://cf.geekdo-images.com/PhjygpWSo-0labGrPBMyyg__original/img/mZzaBAEEJpMlHWWmC0R6Su0OibQ=/0x0/filters:format(jpeg)/pic5666597.jpg',
    description: 'Dune: Imperium combina la construcción de mazos y la colocación de trabajadores en una profunda estrategia política y militar en Arrakis.',
    weight: 3.04,
    min_players: 1,
    max_players: 4,
    playing_time: 120,
    base_price_eur: 48.50,
  },
  {
    bgg_id: 173346,
    name: '7 Wonders Duel',
    thumbnail: 'https://cf.geekdo-images.com/zdagMskTF7wJBPjX74XsRw__small/img/gV1-ckZSIC-dCxxpq1Y7GmPITzQ=/fit-in/200x150/filters:strip_icc()/pic2576399.jpg',
    image: 'https://cf.geekdo-images.com/zdagMskTF7wJBPjX74XsRw__original/img/Ju836WNSaW7Mab9Vjq2TJ_FqhWQ=/0x0/filters:format(jpeg)/pic2576399.jpg',
    description: 'En 7 Wonders Duel te enfrentarás a un solo rival para liderar una civilización hacia la victoria científica, militar o civil.',
    weight: 2.24,
    min_players: 2,
    max_players: 2,
    playing_time: 30,
    base_price_eur: 24.90,
  },
  {
    bgg_id: 230802,
    name: 'Azul',
    thumbnail: 'https://cf.geekdo-images.com/aPSHJO0d0XOpQR5X-wJonw__small/img/ccsXKrdGJw-YSClWwzVUwk5Nh9Y=/fit-in/200x150/filters:strip_icc()/pic6973671.png',
    image: 'https://cf.geekdo-images.com/aPSHJO0d0XOpQR5X-wJonw__original/img/AkbtYVc6xXJF3c9EUrakklcclKw=/0x0/filters:format(png)/pic6973671.png',
    description: 'En Azul, los jugadores compiten como artesanos para decorar las paredes del Palacio Real de Évora con hermosas losetas.',
    weight: 1.76,
    min_players: 2,
    max_players: 4,
    playing_time: 45,
    base_price_eur: 39.90,
  },
  {
    bgg_id: 237182,
    name: 'Root',
    thumbnail: 'https://cf.geekdo-images.com/JUAUWaVUzeBgzirhZNmHHw__small/img/ACovMZzGGIsBRyEQXFnsT8282NM=/fit-in/200x150/filters:strip_icc()/pic4254509.jpg',
    image: 'https://cf.geekdo-images.com/JUAUWaVUzeBgzirhZNmHHw__original/img/E0s2LvtFA1L5YKk-_44D4u2VD2s=/0x0/filters:format(jpeg)/pic4254509.jpg',
    description: 'Root es un juego de aventuras y guerra asimétrica donde los jugadores luchan por el control de un vasto bosque.',
    weight: 3.78,
    min_players: 2,
    max_players: 4,
    playing_time: 90,
    base_price_eur: 58.00,
  },
  {
    bgg_id: 822,
    name: 'Carcassonne',
    thumbnail: 'https://cf.geekdo-images.com/peUgu3A20LRmAXAMyDQfpQ__small/img/oEEslN-EGqh82sNI6Aj4_MFXYg0=/fit-in/200x150/filters:strip_icc()/pic8621446.jpg',
    image: 'https://cf.geekdo-images.com/peUgu3A20LRmAXAMyDQfpQ__original/img/bP18m_PYjyFOv1IBGgMOteQUneA=/0x0/filters:format(jpeg)/pic8621446.jpg',
    description: 'Carcassonne es un juego clásico de colocación de losetas en el que los jugadores construyen el paisaje medieval francés de caminos, ciudades y monasterios.',
    weight: 1.90,
    min_players: 2,
    max_players: 5,
    playing_time: 45,
    base_price_eur: 29.90,
  }
];

export function getMockOffersForGame(bggId: number, countryCode: string = 'MX') {
  const game = MOCK_GAMES.find((g) => g.bgg_id === bggId) || MOCK_GAMES[0];
  const targetStores = MOCK_IBEROAMERICAN_STORES.filter((s) => s.country === 'MX');

  return targetStores.map((store, idx) => {
    const baseMxnPrice = Math.max(250, Math.round(game.base_price_eur * 20 + ((idx % 3) - 1) * 45));
    const shipping_flat = store.default_shipping_flat;
    const shipping_free_threshold = store.free_shipping_threshold;

    // Stock availability: most in stock, every 4th item out of stock to test stock alerts
    const stock = idx === 3 ? 0 : (idx + 1) * 4;

    return {
      id: `offer-${bggId}-${store.id}`,
      store_id: store.id,
      store_name: store.name,
      store_logo: store.logo_url,
      store_country: store.country,
      rating: store.rating,
      review_count: store.review_count,
      store_product_url: store.website,
      price: baseMxnPrice,
      stock,
      edition_language: 'es',
      shipping_flat,
      shipping_free_threshold,
      is_featured: idx === 0, // El Duende featured recommendation
    };
  });
}
