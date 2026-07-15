import { NextResponse } from 'next/server';
import { seedActualFeedsIntoDatabase } from '@/utils/real_feed_data';

export async function POST() {
  try {
    const stats = await seedActualFeedsIntoDatabase();
    return NextResponse.json({
      success: true,
      message: 'Base de datos poblada con éxito a partir de los feeds XML reales de las tiendas verificadas en México.',
      stats,
    });
  } catch (err: unknown) {
    console.error('[Seed Data API] Error:', err);
    return NextResponse.json({ error: 'Fallo al poblar datos reales desde los feeds XML.' }, { status: 500 });
  }
}
