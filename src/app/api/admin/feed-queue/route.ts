import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SessionData {
  user?: {
    email?: string | null;
  };
}

async function checkAdmin(session: SessionData | null) {
  if (!session || !session.user?.email) {
    return false;
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('email', session.user.email)
    .single();
  return profile?.role === 'admin';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!await checkAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden. Administrator access required.' }, { status: 403 });
  }

  try {
    const { data: items, error } = await supabase
      .from('bgg_metadata_queue')
      .select('id, store_id, ean, title, store_product_url, status, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[Admin Feed Queue] Select failed:', error.message);
      return NextResponse.json({ error: 'Failed to fetch queue items.' }, { status: 500 });
    }

    return NextResponse.json({ items: items || [] });
  } catch (err: unknown) {
    console.error('[Admin Feed Queue] Crash:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!await checkAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden. Administrator access required.' }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing item ID.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('bgg_metadata_queue')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete queue item.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[Admin Feed Queue] Delete crash:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
