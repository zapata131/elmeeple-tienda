import { NextRequest, NextResponse } from 'next/server';
import { fetchPriceHistory } from '@/lib/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bggId = Number(searchParams.get('bgg_id'));
  const days = Number(searchParams.get('days') || '30');

  if (!bggId) {
    return NextResponse.json({ error: 'Missing bgg_id parameter' }, { status: 400 });
  }

  try {
    const history = await fetchPriceHistory(bggId, days);
    return NextResponse.json(history);
  } catch (err) {
    console.error('[API Price History] Error:', err);
    return NextResponse.json([]);
  }
}
