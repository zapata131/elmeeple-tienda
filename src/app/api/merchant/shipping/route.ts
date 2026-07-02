import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  try {
    const { store_id, rates } = await request.json();

    if (!store_id || !Array.isArray(rates)) {
      return NextResponse.json({ error: 'Invalid parameters.' }, { status: 400 });
    }

    // Verify store ownership
    const { data: store, error: storeErr } = await supabase
      .from('stores')
      .select('id')
      .eq('id', store_id)
      .eq('owner_email', session.user.email)
      .single();

    if (storeErr || !store) {
      console.error('[API Shipping] Ownership verification failed:', storeErr?.message);
      return NextResponse.json({ error: 'Forbidden. You do not own this store.' }, { status: 403 });
    }

    interface RateInput {
      destination_country: string;
      flat_rate: number;
      free_shipping_threshold: number | null;
    }

    // Prepare upsert rows
    const rows = (rates as RateInput[]).map((r) => ({
      store_id: store_id,
      destination_country: r.destination_country,
      flat_rate: Number(r.flat_rate),
      free_shipping_threshold: r.free_shipping_threshold !== null && r.free_shipping_threshold !== undefined ? Number(r.free_shipping_threshold) : null,
    }));

    // Upsert matrix rates
    const { error: upsertErr } = await supabase
      .from('shipping_rates')
      .upsert(rows);

    if (upsertErr) {
      console.error('[API Shipping] Upsert failed:', upsertErr.message);
      return NextResponse.json({ error: 'Failed to update shipping rates.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API Shipping] Handler error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
