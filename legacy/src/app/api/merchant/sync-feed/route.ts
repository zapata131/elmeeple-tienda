import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import { parseGoogleFeed, syncStoreCatalog } from '@/utils/feed_parser';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  try {
    const { data: store, error: storeErr } = await supabase
      .from('stores')
      .select('id, google_shopping_feed_url')
      .eq('owner_email', session.user.email)
      .single();

    if (storeErr || !store) {
      return NextResponse.json({ error: 'Merchant store not found.' }, { status: 404 });
    }

    if (!store.google_shopping_feed_url) {
      return NextResponse.json({ error: 'Feed URL not configured for this store.' }, { status: 400 });
    }

    // Force download XML feed
    const res = await fetch(store.google_shopping_feed_url);

    if (!res.ok) {
      throw new Error(`Feed request failed: ${res.statusText}`);
    }

    const xml = await res.text();
    const items = parseGoogleFeed(xml);
    const stats = await syncStoreCatalog(store.id, items);

    return NextResponse.json({ success: true, ...stats });
  } catch (err: unknown) {
    console.error('[API Force Sync] Crash:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Synchronization failed.' },
      { status: 500 }
    );
  }
}
