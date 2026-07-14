import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeId, queueId, merchantSku, bggId, storeProductUrl, price } = body;

    if (!storeId || !bggId || (!merchantSku && !storeProductUrl)) {
      return NextResponse.json({ error: 'Faltan datos obligatorios (tienda, BGG ID, SKU/URL).' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const skuToBind = merchantSku || storeProductUrl;

    // 1. Save to merchant_product_mappings (Tier 2 Permanent Memory)
    const { error: mapErr } = await supabase.from('merchant_product_mappings').upsert({
      store_id: storeId,
      merchant_sku: skuToBind,
      bgg_id: Number(bggId),
      is_verified: true,
      mapped_at: new Date().toISOString(),
    }, { onConflict: 'store_id,merchant_sku' });

    if (mapErr) {
      console.error('[Merchant Mapping API] Error writing mapping memory:', mapErr.message);
    }

    // 2. Publish/Upsert offer in store_games
    if (storeProductUrl) {
      await supabase.from('store_games').upsert({
        store_id: storeId,
        bgg_id: Number(bggId),
        store_product_url: storeProductUrl,
        price: Number(price || 850.00),
        stock: 1,
        edition_language: 'es',
        match_confidence: 1.00,
        match_tier: 2,
        last_updated_at: new Date().toISOString(),
      }, { onConflict: 'store_id,bgg_id' });
    }

    // 3. If queueId passed, mark queue item as approved
    if (queueId) {
      await supabase
        .from('bgg_metadata_queue')
        .update({ status: 'approved' })
        .eq('id', queueId);
    }

    return NextResponse.json({
      success: true,
      message: 'Producto vinculado correctamente y registrado en la memoria de mapeos permanentes.',
    });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
