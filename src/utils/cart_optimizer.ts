export interface StoreInfo {
  id: string;
  name: string;
  base_url: string;
}

export interface ShippingRateInfo {
  store_id: string;
  destination_country: string;
  flat_rate: number;
  free_shipping_threshold: number | null;
}

export interface StoreGameOffer {
  store_id: string;
  bgg_id: number;
  price: number;
  stock: number;
  store_product_url: string;
  game_name?: string;
}

export interface StoreItemBreakdown {
  bggId: number;
  gameName: string;
  price: number;
  productUrl: string;
}

export interface StoreBundleBreakdown {
  storeId: string;
  storeName: string;
  storeUrl: string;
  items: StoreItemBreakdown[];
  subtotal: number;
  shippingFee: number;
  storeTotal: number;
  qualifiesForFreeShipping: boolean;
}

export interface CartCombinationResult {
  id: string;
  totalCost: number;
  totalItemsPrice: number;
  totalShippingCost: number;
  storeBreakdowns: StoreBundleBreakdown[];
  storeCount: number;
}

export function optimizeCart(
  gameIds: number[],
  destinationCountry: string,
  offers: StoreGameOffer[],
  shippingRates: ShippingRateInfo[],
  storesMap: Record<string, StoreInfo>
): CartCombinationResult[] {
  if (gameIds.length === 0 || offers.length === 0) {
    return [];
  }

  // Filter available offers for requested games
  const availableOffersByGame: Record<number, StoreGameOffer[]> = {};
  for (const gId of gameIds) {
    availableOffersByGame[gId] = offers.filter((o) => o.bgg_id === gId && o.stock > 0 && o.price > 0);
    // If any requested game has 0 available store offers, we can only optimize the subset available or return incomplete
    if (availableOffersByGame[gId].length === 0) {
      return [];
    }
  }

  // Build shipping lookup map: storeId -> rate info for destinationCountry
  const shippingMap: Record<string, ShippingRateInfo> = {};
  for (const rate of shippingRates) {
    if (rate.destination_country.toUpperCase() === destinationCountry.toUpperCase()) {
      shippingMap[rate.store_id] = rate;
    }
  }

  // Generate combinations using recursion (Cartesian product of store choices per game)
  const candidateAssignments: Array<Record<number, StoreGameOffer>> = [];
  const maxCandidates = 5000;

  function generate(index: number, current: Record<number, StoreGameOffer>) {
    if (candidateAssignments.length >= maxCandidates) {
      return;
    }
    if (index === gameIds.length) {
      candidateAssignments.push({ ...current });
      return;
    }

    const gId = gameIds[index];
    const choices = availableOffersByGame[gId];
    for (const choice of choices) {
      current[gId] = choice;
      generate(index + 1, current);
    }
  }

  generate(0, {});

  // Evaluate candidate combinations
  const evaluatedResults: CartCombinationResult[] = candidateAssignments.map((assignment, idx) => {
    // Group selected offers by storeId
    const storeGroups: Record<string, StoreGameOffer[]> = {};
    for (const gId of gameIds) {
      const offer = assignment[gId];
      if (!storeGroups[offer.store_id]) {
        storeGroups[offer.store_id] = [];
      }
      storeGroups[offer.store_id].push(offer);
    }

    let totalItemsPrice = 0;
    let totalShippingCost = 0;
    const storeBreakdowns: StoreBundleBreakdown[] = [];

    for (const [storeId, storeItems] of Object.entries(storeGroups)) {
      const storeInfo = storesMap[storeId] || { id: storeId, name: `Tienda (${storeId.slice(0, 6)})`, base_url: '' };
      const subtotal = storeItems.reduce((acc, it) => acc + Number(it.price), 0);
      
      const shipRate = shippingMap[storeId];
      const flatRate = shipRate ? Number(shipRate.flat_rate) : 12.0; // fallback default international flat rate
      const threshold = shipRate && shipRate.free_shipping_threshold ? Number(shipRate.free_shipping_threshold) : null;

      let shippingFee = flatRate;
      let qualifiesForFreeShipping = false;

      if (threshold !== null && subtotal >= threshold) {
        shippingFee = 0;
        qualifiesForFreeShipping = true;
      }

      const storeTotal = subtotal + shippingFee;
      totalItemsPrice += subtotal;
      totalShippingCost += shippingFee;

      const itemsBreakdown: StoreItemBreakdown[] = storeItems.map((it) => ({
        bggId: it.bgg_id,
        gameName: it.game_name || `Juego #${it.bgg_id}`,
        price: Number(it.price),
        productUrl: it.store_product_url,
      }));

      storeBreakdowns.push({
        storeId,
        storeName: storeInfo.name,
        storeUrl: storeInfo.base_url,
        items: itemsBreakdown,
        subtotal,
        shippingFee,
        storeTotal,
        qualifiesForFreeShipping,
      });
    }

    const totalCost = totalItemsPrice + totalShippingCost;

    return {
      id: `comb-${idx}-${Object.keys(storeGroups).join('-')}`,
      totalCost: Number(totalCost.toFixed(2)),
      totalItemsPrice: Number(totalItemsPrice.toFixed(2)),
      totalShippingCost: Number(totalShippingCost.toFixed(2)),
      storeBreakdowns: storeBreakdowns.sort((a, b) => b.storeTotal - a.storeTotal),
      storeCount: Object.keys(storeGroups).length,
    };
  });

  // Sort by lowest total cost first, then by fewest stores (convenience tie-breaker)
  evaluatedResults.sort((a, b) => {
    if (Math.abs(a.totalCost - b.totalCost) > 0.001) {
      return a.totalCost - b.totalCost;
    }
    return a.storeCount - b.storeCount;
  });

  // Deduplicate identical cost/store setups and return top 3
  const uniqueResults: CartCombinationResult[] = [];
  const seenSignatures = new Set<string>();

  for (const res of evaluatedResults) {
    const sig = res.storeBreakdowns
      .map((b) => `${b.storeId}:${b.items.map((i) => i.bggId).sort().join(',')}`)
      .sort()
      .join('|');

    if (!seenSignatures.has(sig)) {
      seenSignatures.add(sig);
      uniqueResults.push(res);
      if (uniqueResults.length === 3) {
        break;
      }
    }
  }

  return uniqueResults;
}
