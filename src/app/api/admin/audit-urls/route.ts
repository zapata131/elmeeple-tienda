import { NextResponse } from 'next/server';
import { auditAllDatabaseStoreOfferUrls } from '@/utils/url_product_audit_worker';

export async function GET() {
  try {
    const report = await auditAllDatabaseStoreOfferUrls();
    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to execute URL audit' },
      { status: 500 }
    );
  }
}
