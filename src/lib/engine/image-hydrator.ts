import { db } from '@/lib/db/db';
import { XMLParser } from 'fast-xml-parser';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

export interface BggImageResult {
  image: string | null;
  thumbnail: string | null;
  realBggId?: number;
}

/**
 * Fetch official high-resolution cover artwork from BoardGameGeek API
 */
export async function fetchBggImageFromApi(bggId: number, name?: string): Promise<BggImageResult | null> {
  try {
    let targetId = bggId;

    // If pseudo BGG ID (e.g. > 900000), search BGG by name first to get real BGG ID
    if (targetId >= 900000 && name) {
      const cleanSearchName = name.replace(/([^\w\s]|_)+/gi, ' ').trim();
      const searchRes = await fetch(`https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(cleanSearchName)}&type=boardgame`, {
        headers: { 'User-Agent': 'MeeplePrecios/1.0' },
      });

      if (searchRes.ok) {
        const searchXml = await searchRes.text();
        const searchData = xmlParser.parse(searchXml);
        const items = searchData?.items?.item;
        const firstItem = Array.isArray(items) ? items[0] : items;
        if (firstItem && firstItem['@_id']) {
          targetId = parseInt(firstItem['@_id'], 10);
        }
      }
    }

    if (targetId < 900000) {
      const thingRes = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${targetId}`, {
        headers: { 'User-Agent': 'MeeplePrecios/1.0' },
      });

      if (thingRes.ok) {
        const thingXml = await thingRes.text();
        const thingData = xmlParser.parse(thingXml);
        const item = thingData?.items?.item;
        const gameItem = Array.isArray(item) ? item[0] : item;

        if (gameItem) {
          const image = typeof gameItem.image === 'string' ? gameItem.image : null;
          const thumbnail = typeof gameItem.thumbnail === 'string' ? gameItem.thumbnail : null;

          return {
            image,
            thumbnail,
            realBggId: targetId !== bggId ? targetId : undefined,
          };
        }
      }
    }
  } catch (e) {
    console.error(`[IMAGE-HYDRATOR] Error fetching BGG image for BGG ID ${bggId}:`, e);
  }

  return null;
}

/**
 * Enriches single game image in database
 */
export async function enrichGameImagesFromBgg(
  bggId: number,
  customFetcher?: (bggId: number, name?: string) => Promise<BggImageResult | null>
) {
  const game = db.getBggGameById(bggId);
  if (!game) return null;

  const fetcher = customFetcher || fetchBggImageFromApi;
  const result = await fetcher(bggId, game.name);

  if (result && (result.image || result.thumbnail)) {
    const updated = db.upsertBggGame({
      ...game,
      bgg_id: result.realBggId || game.bgg_id,
      image: result.image || game.image,
      thumbnail: result.thumbnail || game.thumbnail || result.image || game.image,
    });
    return updated;
  }

  return game;
}

/**
 * Batch scans all catalog games and enriches unsplash/missing images
 */
export async function batchEnrichCatalogImages(options?: { limit?: number; delayMs?: number }) {
  const games = db.getBggGames();
  const limit = options?.limit || 50;
  const delayMs = options?.delayMs || 500;

  const gamesNeedingImages = games.filter(g =>
    !g.image ||
    g.image.includes('unsplash.com') ||
    g.image.includes('placeholder')
  ).slice(0, limit);

  let enrichedCount = 0;

  for (const game of gamesNeedingImages) {
    const res = await enrichGameImagesFromBgg(game.bgg_id);
    if (res && res.image && !res.image.includes('unsplash.com')) {
      enrichedCount++;
    }
    if (delayMs > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  return {
    scanned: gamesNeedingImages.length,
    enrichedCount,
  };
}
