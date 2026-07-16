import { describe, it, expect } from 'vitest';
import { GET as diagnosticsGetHandler, POST as diagnosticsPostHandler } from '@/app/api/admin/diagnostics/route';
import { NextRequest } from 'next/server';

describe('US-22: Admin Catalog Health & Feed Diagnostics Dashboard API', () => {
  it('GET /api/admin/diagnostics should return catalog health metrics and store feed diagnostics', async () => {
    const req = new NextRequest('http://localhost:3001/api/admin/diagnostics');
    const res = await diagnosticsGetHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.diagnostics).toBeDefined();
    expect(data.diagnostics.total_offers).toBeGreaterThanOrEqual(0);
    expect(data.diagnostics.active_offers).toBeGreaterThanOrEqual(0);
    expect(data.diagnostics.broken_offers).toBeGreaterThanOrEqual(0);
    expect(data.diagnostics.total_stores).toBeGreaterThan(0);
    expect(data.diagnostics.stores_status).toBeDefined();
    expect(Array.isArray(data.diagnostics.stores_status)).toBe(true);
  });

  it('POST /api/admin/diagnostics with trigger_resync should trigger feed re-sync', async () => {
    const req = new NextRequest('http://localhost:3001/api/admin/diagnostics', {
      method: 'POST',
      body: JSON.stringify({ action: 'trigger_resync' }),
    });
    const res = await diagnosticsPostHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.message).toContain('re-sincronizados');
  });

  it('POST /api/admin/diagnostics with trigger_audit should trigger catalog audit', async () => {
    const req = new NextRequest('http://localhost:3001/api/admin/diagnostics', {
      method: 'POST',
      body: JSON.stringify({ action: 'trigger_audit' }),
    });
    const res = await diagnosticsPostHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.message.toLowerCase()).toContain('auditoría');
  });

  it('POST /api/admin/diagnostics with toggle_auto_audit should toggle setting', async () => {
    const req = new NextRequest('http://localhost:3001/api/admin/diagnostics', {
      method: 'POST',
      body: JSON.stringify({ action: 'toggle_auto_audit', enabled: false }),
    });
    const res = await diagnosticsPostHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.diagnostics.auto_audit_enabled).toBe(false);
  });
});
