import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MOCK_IBEROAMERICAN_STORES, MOCK_GAMES } from '@/utils/mockData';

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
          const targetUrl = appendAffiliateParams(directUrl);
          return NextResponse.redirect(targetUrl, 302);
        }
        if (offerId.startsWith('offer-') || offerId.startsWith('real-feed-')) {
          const prefixRemoved = offerId.replace(/^(offer-|real-feed-)/, '');
          const parts = prefixRemoved.split('-');
          const bggId = parseInt(parts[0], 10);
          const storeId = parts.slice(1).join('-');
          const storeMatch = MOCK_IBEROAMERICAN_STORES.find((s) => s.id === storeId);
          const gameMatch = MOCK_GAMES.find((g) => g.bgg_id === bggId);
          if (storeMatch) {
            const query = gameMatch ? encodeURIComponent(gameMatch.name) : '';
            const targetUrl = appendAffiliateParams(`${storeMatch.website}/search?q=${query}`);
            return NextResponse.redirect(targetUrl, 302);
          }
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

      const targetUrl = appendAffiliateParams(offer.store_product_url);
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

    const targetUrl = appendAffiliateParams(directUrl!);
    return NextResponse.redirect(targetUrl, 302);
  } catch (err) {
    console.error('[Redirect API] Handler crashed:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
