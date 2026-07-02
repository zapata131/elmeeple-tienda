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
    const body = await request.json();
    const { name, base_url, slug, logo_url, shipping_flat, shipping_free_threshold, feed_url } = body;

    if (!name || !base_url || !slug || shipping_flat === undefined || shipping_flat === null) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios.' }, { status: 400 });
    }

    // Resolve profile ID from user email
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (profErr || !profile) {
      console.error('[API Onboard] Profile lookup failed:', profErr?.message);
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    // Insert store row
    const { data: store, error: storeErr } = await supabase
      .from('stores')
      .insert({
        name,
        slug,
        base_url,
        logo_url: logo_url || null,
        google_shopping_feed_url: feed_url || null,
        owner_email: session.user.email,
        verified: false,
        feed_status: 'pending',
      })
      .select('id')
      .single();

    if (storeErr || !store) {
      console.error('[API Onboard] Store insertion failed:', storeErr?.message);
      return NextResponse.json({ error: 'Fallo al registrar la tienda.' }, { status: 500 });
    }

    // Insert shipping rate for ES
    const { error: shipErr } = await supabase
      .from('shipping_rates')
      .insert({
        store_id: store.id,
        destination_country: 'ES',
        flat_rate: Number(shipping_flat),
        free_shipping_threshold: shipping_free_threshold !== null && shipping_free_threshold !== undefined ? Number(shipping_free_threshold) : null,
      });

    if (shipErr) {
      console.error('[API Onboard] Shipping insertion failed:', shipErr.message);
      // Delete store to prevent orphaned record, but keep it simple for MVP
    }

    // Upgrade profile role to 'partner'
    const { error: roleErr } = await supabase
      .from('profiles')
      .update({ role: 'partner' })
      .eq('id', profile.id);

    if (roleErr) {
      console.error('[API Onboard] Profile role upgrade failed:', roleErr.message);
    }

    return NextResponse.json({ success: true, store_id: store.id }, { status: 201 });
  } catch (err) {
    console.error('[API Onboard] Handler error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
