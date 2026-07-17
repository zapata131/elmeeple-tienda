import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { runCatalogAudit } from '@/lib/engine/audit-worker';
import { processBggQueue } from '@/lib/engine/bgg-hydrator';

export async function GET() {
  const diagnostics = db.getDiagnostics();
  return NextResponse.json({
    success: true,
    diagnostics,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, enabled } = body;

    let message = 'Acción ejecutada correctamente.';

    if (action === 'trigger_resync') {
      const stores = db.getStores();
      stores.forEach((s) => {
        db.updateStore(s.id, { feed_status: 'success' });
      });
      message = 'Todos los feeds de tiendas fueron re-sincronizados correctamente.';
    } else if (action === 'trigger_audit') {
      await runCatalogAudit();
      message = 'Auditoría de enlaces de catálogo completada exitosamente.';
    } else if (action === 'trigger_hydration') {
      await processBggQueue({ delayMs: 10 });
      message = 'Cola de metadatos BGG procesada exitosamente.';
    } else if (action === 'toggle_auto_audit') {
      const newState = db.setAutoAuditEnabled(Boolean(enabled));
      message = `Auditoría automática de enlaces ${newState ? 'activada' : 'desactivada'}.`;
    } else if (action === 'toggle_auto_hydration') {
      const newState = db.setAutoHydrationEnabled(Boolean(enabled));
      message = `Hidratación automática BGG ${newState ? 'activada' : 'desactivada'}.`;
    }

    const updatedDiagnostics = db.getDiagnostics();
    return NextResponse.json({
      success: true,
      message,
      diagnostics: updatedDiagnostics,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al procesar diagnóstico admin.' },
      { status: 500 }
    );
  }
}
