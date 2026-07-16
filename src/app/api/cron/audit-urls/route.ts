import { NextRequest, NextResponse } from 'next/server';
import { runCatalogAudit } from '@/lib/engine/audit-worker';

function verifyAuthorization(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'your-secure-cron-secret-token';
  const expectedHeader = `Bearer ${cronSecret}`;

  if (!authHeader || authHeader !== expectedHeader) {
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  if (!verifyAuthorization(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const auditResult = await runCatalogAudit();
  return NextResponse.json({
    success: true,
    total_audited: auditResult.totalScanned,
    broken_links_found: auditResult.brokenCount,
    quarantined_offers: auditResult.quarantinedOffers,
    audited_at: auditResult.timestamp,
  });
}

export async function POST(request: NextRequest) {
  if (!verifyAuthorization(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const auditResult = await runCatalogAudit();
  return NextResponse.json({
    success: true,
    total_audited: auditResult.totalScanned,
    broken_links_found: auditResult.brokenCount,
    quarantined_offers: auditResult.quarantinedOffers,
    audited_at: auditResult.timestamp,
  });
}
