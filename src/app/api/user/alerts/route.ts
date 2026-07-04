import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AlertRow {
  id: string;
  bgg_id: number;
  user_email: string;
  target_price: number;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Missing user email' }, { status: 400 });
  }

  try {
    const { data: alertsData, error } = await supabase
      .from('price_alerts')
      .select('id, bgg_id, user_email, target_price, created_at')
      .eq('user_email', email);

    if (error) {
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    const alerts: AlertRow[] = (alertsData || []) as AlertRow[];
    const bggIds = Array.from(new Set(alerts.map((a: AlertRow) => a.bgg_id)));

    // Fetch game cache metadata
    const gamesMap: Record<number, { name: string; thumbnail: string }> = {};
    if (bggIds.length > 0) {
      const { data: gamesData } = await supabase
        .from('bgg_games_cache')
        .select('bgg_id, name, thumbnail')
        .in('bgg_id', bggIds);

      for (const g of gamesData || []) {
        gamesMap[g.bgg_id] = { name: g.name, thumbnail: g.thumbnail };
      }
    }

    // Fetch lowest price currently available in store_games
    const lowestPriceMap: Record<number, number> = {};
    if (bggIds.length > 0) {
      const { data: offersData } = await supabase
        .from('store_games')
        .select('bgg_id, price')
        .in('bgg_id', bggIds);

      for (const o of offersData || []) {
        const p = Number(o.price);
        if (!lowestPriceMap[o.bgg_id] || p < lowestPriceMap[o.bgg_id]) {
          lowestPriceMap[o.bgg_id] = p;
        }
      }
    }

    const formattedAlerts = alerts.map((a: AlertRow) => {
      const g = gamesMap[a.bgg_id] || { name: `Juego #${a.bgg_id}`, thumbnail: '' };
      const currentLowest = lowestPriceMap[a.bgg_id] || Number(a.target_price || 0);

      return {
        id: a.id,
        bggId: a.bgg_id,
        gameName: g.name,
        thumbnail: g.thumbnail,
        targetPrice: null,
        currentLowestPrice: currentLowest,
        isTriggered: false,
        createdAt: a.created_at,
      };
    });

    return NextResponse.json({ alerts: formattedAlerts });
  } catch (err) {
    console.error('[User Alerts API GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { alertId } = await request.json();
    if (!alertId) {
      return NextResponse.json({ error: 'Missing alertId' }, { status: 400 });
    }

    const { error } = await supabase
      .from('price_alerts')
      .delete()
      .eq('id', alertId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[User Alerts API DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ success: true, message: 'Target price editing removed.' });
}
