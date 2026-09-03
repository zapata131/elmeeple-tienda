import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const offerId = searchParams.get('offer_id');
  const destinationUrl = searchParams.get('url');

  if (!destinationUrl) {
    return NextResponse.json({ error: 'URL de destino requerida' }, { status: 400 });
  }

  // Construct tracked destination URL with UTM parameters
  let targetUrl: URL;
  try {
    targetUrl = new URL(destinationUrl);
  } catch {
    return NextResponse.json({ error: 'URL de destino inválida' }, { status: 400 });
  }

  targetUrl.searchParams.set('utm_source', 'meepleprecios');
  targetUrl.searchParams.set('utm_medium', 'price_comparison');
  targetUrl.searchParams.set('utm_campaign', 'affiliate_redirect');

  // Asynchronous non-blocking click recording
  if (offerId) {
    const userAgent = request.headers.get('user-agent') || undefined;
    db.recordClick({
      offer_id: offerId,
      store_id: searchParams.get('store_id') || '',
      destination_url: targetUrl.toString(),
      user_agent: userAgent,
    }).catch(() => {});
  }

  return NextResponse.redirect(targetUrl.toString(), 302);
}
