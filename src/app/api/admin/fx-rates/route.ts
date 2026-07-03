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
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    // Verify admin role
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (profileErr || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Administrator access required.' }, { status: 403 });
    }

    const { currency, rate, enabled } = await request.json();

    if (!currency || typeof currency !== 'string') {
      return NextResponse.json({ error: 'Invalid currency code.' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (rate !== undefined && typeof rate === 'number' && rate > 0) {
      updatePayload.rate = rate;
    }
    if (enabled !== undefined && typeof enabled === 'boolean') {
      updatePayload.enabled = enabled;
    }

    const { error: updateErr } = await supabase
      .from('exchange_rates')
      .update(updatePayload)
      .eq('currency', currency.toUpperCase());

    if (updateErr) {
      console.error('[Admin FX Rates] Update failed:', updateErr.message);
      return NextResponse.json({ error: 'Failed to update FX rate.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[Admin FX Rates] Crash:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
