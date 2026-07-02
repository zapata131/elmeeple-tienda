import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
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
    const { bgg_id, target_price, currency } = await request.json();

    if (!bgg_id || !target_price || target_price <= 0 || !currency) {
      return NextResponse.json({ error: 'Invalid parameters.' }, { status: 400 });
    }

    // Resolve profile ID from user email
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (profErr || !profile) {
      console.error('[API Price Alerts] Profile lookup failed:', profErr?.message);
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    // Insert alert
    const { error: insErr } = await supabase
      .from('price_alerts')
      .insert({
        user_id: profile.id,
        bgg_id: Number(bgg_id),
        target_price: Number(target_price),
        currency: currency,
      });

    if (insErr) {
      console.error('[API Price Alerts] Insertion failed:', insErr.message);
      return NextResponse.json({ error: 'Failed to create price alert.' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('[API Price Alerts] Handler error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
