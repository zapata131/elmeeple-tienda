import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/mock-db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id') || '';
  const bggId = parseInt(searchParams.get('bgg_id') || '0', 10);
  const rawUrl = searchParams.get('url') || '';

  if (!rawUrl) {
    return NextResponse.json({ error: 'Falta la URL de destino.' }, { status: 400 });
  }

  // 1. Log outbound click
  if (storeId && bggId) {
    db.logClick(storeId, bggId, rawUrl);
  }

  // 2. Append UTM tracking parameters
  try {
    const targetUrl = new URL(rawUrl);
    targetUrl.searchParams.set('utm_source', 'meepleprecios');
    targetUrl.searchParams.set('utm_medium', 'affiliate');
    targetUrl.searchParams.set('utm_campaign', 'price_comparison');

    // 3. Respond with HTTP 302 Found redirect
    return NextResponse.redirect(targetUrl.toString(), 302);
  } catch {
    return NextResponse.redirect(rawUrl, 302);
  }
}
