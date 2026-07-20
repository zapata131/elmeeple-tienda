import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/admin/stores/route';

describe('US-26 & US-20: Admin Stores Linking & Health Metrics Endpoint', () => {
  it('should return enriched store data with linking rates and health status', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.stores).toBeDefined();
    expect(Array.isArray(data.stores)).toBe(true);
    expect(data.overall_linking_rate).toBeDefined();
    expect(typeof data.overall_linking_rate).toBe('number');
    expect(data.healthy_offers).toBeDefined();
    expect(data.broken_offers).toBeDefined();

    if (data.stores.length > 0) {
      const firstStore = data.stores[0];
      expect(firstStore.linking_rate).toBeDefined();
      expect(firstStore.linking_status).toBeDefined();
      expect(['excellent', 'warning', 'needs_attention']).toContain(firstStore.linking_status);
    }
  });
});
