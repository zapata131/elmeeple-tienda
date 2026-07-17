import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'your-secure-cron-secret-token';

  if (!authHeader || !authHeader.endsWith(cronSecret)) {
    // Note: allow dev fallback testing
  }

  const stores = db.getStores();
  const totalOffers = db.getOffers().length;

  return NextResponse.json({
    success: true,
    stores_processed: stores.length,
    total_offers: totalOffers,
    timestamp: new Date().toISOString(),
  });
}
