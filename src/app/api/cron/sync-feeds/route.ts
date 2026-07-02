import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseGoogleFeed, syncStoreCatalog } from '@/utils/feed_parser';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  // Optional security check: cron key authorization
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    // Fetch all verified stores with active feed URLs
    const { data: stores, error: storesErr } = await supabase
      .from('stores')
      .select('id, name, google_shopping_feed_url')
      .eq('verified', true)
      .not('google_shopping_feed_url', 'is', null);

    if (storesErr || !stores) {
      console.error('[API Cron Sync] Failed to load stores list:', storesErr?.message);
      return NextResponse.json({ error: 'Failed to load merchant stores.' }, { status: 500 });
    }

    interface SyncReport {
      store_id: string;
      store_name: string;
      status: 'success' | 'failed';
      processed?: number;
      matched?: number;
      unmatched?: number;
      error?: string;
    }
    const report: SyncReport[] = [];

    for (const store of stores) {
      try {
        const feedUrl = store.google_shopping_feed_url!;
        const res = await fetch(feedUrl);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch XML file: ${res.statusText}`);
        }

        const xmlText = await res.text();
        const parsedItems = parseGoogleFeed(xmlText);
        
        const stats = await syncStoreCatalog(store.id, parsedItems);
        
        report.push({
          store_id: store.id,
          store_name: store.name,
          status: 'success',
          ...stats,
        });
      } catch (err: unknown) {
        console.error(`[API Cron Sync] Failed syncing feed for store ${store.id}:`, err);
        
        // Update feed status diagnostic as failed
        await supabase
          .from('stores')
          .update({ feed_status: 'failed' })
          .eq('id', store.id);

        report.push({
          store_id: store.id,
          store_name: store.name,
          status: 'failed',
          error: err instanceof Error ? err.message : 'Unknown synchronization error.',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed_stores: report.length,
      details: report,
    });
  } catch (err: unknown) {
    console.error('[API Cron Sync] Handler crash:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
