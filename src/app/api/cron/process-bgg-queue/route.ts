import { NextRequest, NextResponse } from 'next/server';
import { processBggQueue } from '@/lib/engine/bgg-hydrator';

function verifyAuthorization(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'your-secure-cron-secret-token';
  const expectedHeader = `Bearer ${cronSecret}`;

  if (!authHeader || authHeader !== expectedHeader) {
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  if (!verifyAuthorization(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await processBggQueue();
  return NextResponse.json({
    success: true,
    processed_count: summary.totalQueued,
    hydrated_count: summary.hydratedCount,
    failed_count: summary.failedCount,
    timestamp: summary.timestamp,
  });
}

export async function POST(request: NextRequest) {
  if (!verifyAuthorization(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await processBggQueue();
  return NextResponse.json({
    success: true,
    processed_count: summary.totalQueued,
    hydrated_count: summary.hydratedCount,
    failed_count: summary.failedCount,
    timestamp: summary.timestamp,
  });
}
