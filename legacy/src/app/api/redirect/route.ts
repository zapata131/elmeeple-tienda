import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VERIFIED_MEXICAN_STORES } from '@/utils/mockData';
import { loadLocalCatalogCache } from '@/utils/local_file_cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function appendAffiliateParams(rawUrl: string): string {
  try {
    const urlObj = new URL(rawUrl);
    urlObj.searchParams.set('ref', 'meepleprecios');
    urlObj.searchParams.set('utm_source', 'meepleprecios');
    urlObj.searchParams.set('utm_medium', 'affiliate');
    return urlObj.toString();
  } catch {
    const separator = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${separator}ref=meepleprecios&utm_source=meepleprecios&utm_medium=affiliate`;
  }
}

function sanitizeTargetUrl(rawUrl: string): string {
  return appendAffiliateParams(rawUrl);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const offerId = searchParams.get('offer_id');
  const directUrl = searchParams.get('url');

  if (!offerId && !directUrl) {
    return NextResponse.json({ error: 'Missing offer_id or url parameter.' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || null;

  try {
    if (offerId) {
      // Lookup target store game listing
      const { data: offer, error: offerErr } = await supabase
        .from('store_games')
        .select('store_id, bgg_id, store_product_url')
        .eq('id', offerId)
        .single();

      if (offerErr || !offer) {
        if (directUrl) {
          return NextResponse.redirect(sanitizeTargetUrl(directUrl), 302);
        }

        const fileCache = loadLocalCatalogCache();
        const cachedOffer = fileCache?.offers.find((o) => o.id === offerId);
        if (cachedOffer && cachedOffer.store_product_url) {
          return NextResponse.redirect(sanitizeTargetUrl(cachedOffer.store_product_url), 302);
        }

        let storeId = '';
        let bggId = 0;

        if (offerId.startsWith('offer-') || offerId.startsWith('real-feed-')) {
          const prefixRemoved = offerId.replace(/^(offer-|real-feed-)/, '');
          const parts = prefixRemoved.split('-');
          if (parts.length >= 6 && parts[0].length === 8) {
            storeId = parts.slice(0, 5).join('-');
            bggId = parseInt(parts[5], 10);
          } else if (parts.length >= 6 && !isNaN(parseInt(parts[0], 10))) {
            bggId = parseInt(parts[0], 10);
            storeId = parts.slice(1).join('-');
          } else {
            bggId = parseInt(parts[0], 10);
            storeId = parts.slice(1).join('-');
          }
        }

        const storeMatch = VERIFIED_MEXICAN_STORES.find((s) => s.id === storeId || s.slug === storeId);
        const cachedGame = fileCache?.games.find((g) => g.bgg_id === bggId);
        let gameName = cachedGame?.name;

        if (!gameName && bggId > 0) {
          const { data: dbGame } = await supabase
            .from('bgg_games_cache')
            .select('name')
            .eq('bgg_id', bggId)
            .single();
          if (dbGame?.name) {
            gameName = dbGame.name;
          }
        }

        if (storeMatch) {
          const query = gameName ? encodeURIComponent(gameName) : (bggId === 13 ? 'Catan' : (bggId === 359871 ? 'Arcs' : 'juegos de mesa'));
          const baseUrl = storeMatch.website;
          const searchPath = `${baseUrl}/search?q=${query}`;
          const targetUrl = appendAffiliateParams(searchPath);
          return NextResponse.redirect(targetUrl, 302);
        }

        console.error(`[Redirect API] Offer lookup failed for ${offerId}:`, offerErr?.message);
        return NextResponse.json({ error: 'Offer not found.' }, { status: 404 });
      }

      // Log redirect click asynchronously
      const { error: clickErr } = await supabase
        .from('clicks')
        .insert({
          store_id: offer.store_id,
          bgg_id: offer.bgg_id,
          ip_address: ip,
        });

      if (clickErr) {
        console.error('[Redirect API] Failed to log click event:', clickErr.message);
      }

      const targetUrl = sanitizeTargetUrl(offer.store_product_url);
      return NextResponse.redirect(targetUrl, 302);
    }

    // Fallback: direct URL redirection
    const storeId = searchParams.get('store_id');
    const bggIdParam = searchParams.get('bgg_id');
    const bggId = bggIdParam ? parseInt(bggIdParam, 10) : null;

    if (storeId) {
      const { error: clickErr } = await supabase
        .from('clicks')
        .insert({
          store_id: storeId,
          bgg_id: !isNaN(bggId as number) ? bggId : null,
          ip_address: ip,
        });

      if (clickErr) {
        console.error('[Redirect API] Failed to log direct url click event:', clickErr.message);
      }
    }

    const targetUrl = sanitizeTargetUrl(directUrl!);
    return NextResponse.redirect(targetUrl, 302);
  } catch (err) {
    console.error('[Redirect API] Handler crashed:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
