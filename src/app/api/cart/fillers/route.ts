import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FillerProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  thumbnail?: string;
}

const FALLBACK_FILLERS: FillerProduct[] = [
  { id: 'f-101', name: 'Fundas Premium Euro 63x88mm (100 u)', price: 3.5, category: 'Accesorios', thumbnail: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__thumb/img/8a9HeqFydO7Uun_le9bXWPnidcA=/fit-in/200x150/filters:strip_icc()/pic2419375.jpg' },
  { id: 'f-102', name: 'Set Dados D6 Multicolor Moteados', price: 4.9, category: 'Dados', thumbnail: 'https://cf.geekdo-images.com/okM0dq_bEXnbyQTOvHfwRA__thumb/img/h7VbA4i4qM2H9q5913eP2v0MvGE=/fit-in/200x150/filters:strip_icc()/pic6544250.png' },
  { id: 'f-103', name: 'Bandeja Plegable Neopreno para Dados', price: 7.5, category: 'Accesorios', thumbnail: 'https://cf.geekdo-images.com/S3ybV1LAp-8SnHIXLLjVbg__thumb/img/lT0Zt2VwWl2j2k6M_yXk1t4JvA0=/fit-in/200x150/filters:strip_icc()/pic1534148.jpg' },
  { id: 'f-104', name: 'Love Letter (Edición Bolsa Terciopelo)', price: 11.9, category: 'Juego de Cartas', thumbnail: 'https://cf.geekdo-images.com/RvVWTr4XXlA6kS8P6fXNCA__thumb/img/4j3Hk8sF2R9v1M7g3t5y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic5626205.jpg' },
  { id: 'f-105', name: 'Toma 6! (6 Nimmt!) Edición ESP', price: 12.9, category: 'Juego de Cartas', thumbnail: 'https://cf.geekdo-images.com/rwOMxx4q5yuElIv-Bgq4PA__thumb/img/7n3k9g1H8v5M2X6t4y0D5A=/fit-in/200x150/filters:strip_icc()/pic1904079.jpg' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('storeId');
  const gapStr = searchParams.get('gap');

  if (!storeId || !gapStr) {
    return NextResponse.json({ error: 'Missing storeId or gap parameter' }, { status: 400 });
  }

  const gap = Number(gapStr);
  if (isNaN(gap) || gap <= 0) {
    return NextResponse.json({ error: 'Invalid gap parameter' }, { status: 400 });
  }

  try {
    const { data: dbItems, error } = await supabase
      .from('store_accessories')
      .select('id, name, price, category, thumbnail')
      .eq('store_id', storeId);

    let items: FillerProduct[] = (dbItems || []) as FillerProduct[];
    if (error || items.length === 0) {
      items = FALLBACK_FILLERS;
    }

    const recommended = items
      .filter((item) => item.price <= gap + 4.0 && item.price >= 1.5)
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);

    return NextResponse.json({
      fillers: recommended,
      gap: Number(gap.toFixed(2)),
    });
  } catch (err) {
    console.error('[Cart Fillers API GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
