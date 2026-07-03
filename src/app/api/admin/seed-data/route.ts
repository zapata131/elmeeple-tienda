import { NextResponse } from 'next/server';
import { seedMockData } from '@/utils/seed_mock_data';

export async function POST() {
  try {
    const stats = await seedMockData();
    return NextResponse.json({
      success: true,
      message: 'Catálogo de prueba poblado con éxito con portadas de BGG y tarifas regionales.',
      stats,
    });
  } catch (err: unknown) {
    console.error('[Seed Data API] Error:', err);
    return NextResponse.json({ error: 'Fallo al poblar datos de prueba.' }, { status: 500 });
  }
}
