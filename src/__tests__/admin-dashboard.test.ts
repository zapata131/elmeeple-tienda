import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db/db';

describe('US-28: Admin Dashboard Overview Portal (/admin/dashboard)', () => {
  it('should calculate accurate high-level metrics for admin dashboard', () => {
    const stores = db.getStores();
    const games = db.getBggGames();
    const offers = db.getOffers();
    const queueItems = db.getQueueItems();

    expect(stores.length).toBe(51);
    expect(games.length).toBeGreaterThan(0);
    expect(offers.length).toBeGreaterThan(0);
    expect(queueItems).toBeDefined();
  });
});
