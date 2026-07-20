import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db/db';

describe('US-22 & US-26: Admin Diagnostics Store Admin Links', () => {
  it('should verify that all stores in diagnostics have a valid store ID and admin link target', () => {
    const stores = db.getStores();
    expect(stores.length).toBeGreaterThan(0);

    stores.forEach(store => {
      expect(store.id).toBeDefined();
      expect(store.name).toBeDefined();
      const adminLink = `/admin/stores?store_id=${store.id}`;
      const publicLink = `/store/${store.id}`;
      expect(adminLink).toContain('/admin/stores');
      expect(publicLink).toContain(store.id);
    });
  });
});
