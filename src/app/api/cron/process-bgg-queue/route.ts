import { NextResponse } from 'next/server';
import { processMetadataQueueBatch } from '@/utils/bgg_worker';

export async function POST() {
  try {
    const stats = await processMetadataQueueBatch(20);
    return NextResponse.json({ success: true, ...stats });
  } catch (err: unknown) {
    console.error('[Cron BGG Queue] Crash:', err);
    return NextResponse.json({ error: 'Failed to process BGG metadata queue.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stats = await processMetadataQueueBatch(20);
    return NextResponse.json({ success: true, ...stats });
  } catch (err: unknown) {
    console.error('[Cron BGG Queue] Crash:', err);
    return NextResponse.json({ error: 'Failed to process BGG metadata queue.' }, { status: 500 });
  }
}
