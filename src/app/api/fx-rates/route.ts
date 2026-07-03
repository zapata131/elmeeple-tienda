import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data: rates, error } = await supabase
      .from('exchange_rates')
      .select('currency, rate, enabled, updated_at')
      .order('currency');

    if (error) {
      console.error('[API FX Rates] Select failed:', error.message);
      return NextResponse.json({ error: 'Failed to fetch FX rates.' }, { status: 500 });
    }

    return NextResponse.json({ rates: rates || [] });
  } catch (err: unknown) {
    console.error('[API FX Rates] Crash:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
