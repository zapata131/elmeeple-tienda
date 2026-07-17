import { NextResponse } from 'next/server';
import { batchEnrichCatalogImages } from '@/lib/engine/image-hydrator';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const limit = body.limit || 50;

    const summary = await batchEnrichCatalogImages({ limit, delayMs: 200 });

    return NextResponse.json({
      success: true,
      scanned: summary.scanned,
      enriched_count: summary.enrichedCount,
      message: `Enriquecimiento finalizado: ${summary.enrichedCount} imágenes HD actualizadas de BGG.`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error durante el enriquecimiento de imágenes' }, { status: 500 });
  }
}
