import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Discount price alerts have been removed per US-35 / Issue #42.
  return NextResponse.json({
    success: true,
    message: 'Discount alerts have been removed in favor of BGG wishlist sync.',
  }, { status: 200 });
}
