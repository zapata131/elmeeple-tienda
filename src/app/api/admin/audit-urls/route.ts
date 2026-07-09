import { NextResponse } from 'next/server';
import { auditAllDatabaseStoreOfferUrls } from '@/utils/url_product_audit_worker';

export async function GET() {
  try {
    const report = await auditAllDatabaseStoreOfferUrls();
    return NextResponse.json(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to execute URL audit';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
