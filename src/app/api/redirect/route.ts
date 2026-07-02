import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const offerId = searchParams.get('offer_id');

  if (!offerId) {
    return NextResponse.json({ error: 'Missing offer_id parameter.' }, { status: 400 });
  }

  try {
    // Lookup target store game listing
    const { data: offer, error: offerErr } = await supabase
      .from('store_games')
      .select('store_id, bgg_id, store_product_url')
      .eq('id', offerId)
      .single();

    if (offerErr || !offer) {
      console.error(`[Redirect API] Offer lookup failed for ${offerId}:`, offerErr?.message);
      return NextResponse.json({ error: 'Offer not found.' }, { status: 404 });
    }

    // Resolve client IP Address safely
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || null;

    // Log redirect click asynchronously to avoid blocking the user redirection!
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

    // Perform redirect (302 found)
    return NextResponse.redirect(offer.store_product_url, 302);
  } catch (err) {
    console.error('[Redirect API] Handler crashed:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
