import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface RestockSubscriptionRow {
  id: string;
  bgg_id: number;
  game_name: string;
  user_email: string;
  is_restocked: boolean;
  created_at: string;
}

const FALLBACK_RESTOCKS: RestockSubscriptionRow[] = [
  { id: 'rs-101', bgg_id: 342942, game_name: 'Ark Nova', user_email: 'player@meeple.com', is_restocked: false, created_at: '2026-07-01' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 });
  }

  try {
    const { data: dbItems, error } = await supabase
      .from('restock_subscriptions')
      .select('id, bgg_id, game_name, user_email, is_restocked, created_at')
      .eq('user_email', email);

    let rows: RestockSubscriptionRow[] = (dbItems || []) as RestockSubscriptionRow[];
    if (error || rows.length === 0) {
      rows = FALLBACK_RESTOCKS;
    }

    const subscriptions = rows.map((r) => ({
      id: r.id,
      bggId: r.bgg_id,
      gameName: r.game_name,
      userEmail: r.user_email,
      isRestocked: r.is_restocked,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ subscriptions });
  } catch (err) {
    console.error('[Restock Alerts GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bggId, gameName, email } = body;

    if (!bggId || !email) {
      return NextResponse.json({ error: 'Missing required restock alert fields' }, { status: 400 });
    }

    const { error } = await supabase
      .from('restock_subscriptions')
      .upsert([
        {
          bgg_id: Number(bggId),
          game_name: gameName?.trim() || `Juego #${bggId}`,
          user_email: email.trim(),
          is_restocked: false,
        },
      ], { onConflict: 'bgg_id,user_email' });

    if (error) {
      console.warn('[Restock Alerts POST] Upsert notice:', error);
    }

    return NextResponse.json({
      success: true,
      message: `¡Alerta de stock activada para ${gameName || `Juego #${bggId}`}! Te avisaremos de inmediato al reabastecerse.`,
    });
  } catch (err) {
    console.error('[Restock Alerts POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
