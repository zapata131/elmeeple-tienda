import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST() {
  return syncExchangeRates();
}

export async function GET() {
  return syncExchangeRates();
}

async function syncExchangeRates() {
  try {
    // Attempt to fetch from free open exchange rate API (Frankfurter API with base EUR)
    let liveRates: Record<string, number> = {
      EUR: 1.0,
      USD: 1.08,
      MXN: 21.50,
      BRL: 6.05,
      ARS: 1050.0,
      COP: 4400.0,
      CLP: 1020.0,
      PEN: 4.05,
    };

    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD,MXN,BRL,CLP,COP,PEN');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          liveRates = {
            ...liveRates,
            ...data.rates,
          };
        }
      }
    } catch (fetchErr) {
      console.warn('[Sync FX] External API fetch fallback:', fetchErr);
    }

    const now = new Date().toISOString();
    const rows = Object.entries(liveRates).map(([currency, rate]) => ({
      currency,
      rate: Number(rate),
      enabled: true,
      updated_at: now,
    }));

    const { error: upsertErr } = await supabase
      .from('exchange_rates')
      .upsert(rows, { onConflict: 'currency' });

    if (upsertErr) {
      console.error('[Sync FX] Batch upsert failed:', upsertErr.message);
      return NextResponse.json({ error: 'Failed to sync FX rates in database.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated_currencies: rows.length, timestamp: now });
  } catch (err: unknown) {
    console.error('[Sync FX] Crash:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
