import { describe, it, expect, beforeEach } from 'vitest';
import { hydrateBggMetadata, processBggQueue } from '@/lib/engine/bgg-hydrator';
import { GET as processBggCronHandler, POST as processBggCronPostHandler } from '@/app/api/cron/process-bgg-queue/route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/db';

describe('US-21: Automated BGG Metadata Hydration Worker', () => {
  beforeEach(() => {
    // Ensure mock DB has a game missing some metadata for hydration testing
    db.upsertBggGame({
      bgg_id: 9999,
      name: 'Test Unhydrated Game',
      weight: null,
      min_players: null,
      max_players: null,
      image: null,
    });
  });

  it('hydrateBggMetadata should fetch missing metadata and update game cache', async () => {
    const mockFetcher = async (bggId: number) => ({
      weight: 2.45,
      min_players: 2,
      max_players: 4,
      playing_time: 45,
      image: 'https://images.boardgamegeek.com/highres.jpg',
      description: 'Enriched description from BGG.',
    });

    const result = await hydrateBggMetadata(9999, mockFetcher);
    expect(result).not.toBeNull();
    expect(result?.weight).toBe(2.45);
    expect(result?.min_players).toBe(2);
    expect(result?.max_players).toBe(4);
    expect(result?.image).toBe('https://images.boardgamegeek.com/highres.jpg');

    const updatedGame = db.getBggGameById(9999);
    expect(updatedGame?.weight).toBe(2.45);
    expect(updatedGame?.description).toBe('Enriched description from BGG.');
  });

  it('processBggQueue should process incomplete items and apply rate-limit delay configuration', async () => {
    const mockFetcher = async (bggId: number) => ({
      weight: 3.1,
      min_players: 1,
      max_players: 5,
      image: 'https://images.boardgamegeek.com/hydrated.jpg',
    });

    const summary = await processBggQueue({ limit: 5, delayMs: 1, fetcher: mockFetcher });
    expect(summary.totalQueued).toBeGreaterThan(0);
    expect(summary.hydratedCount).toBeGreaterThan(0);
    expect(summary.failedCount).toBe(0);
  });

  it('processBggQueue should gracefully handle fetch errors and status 429 rate limits', async () => {
    const mockFetcher = async () => {
      throw new Error('429 Too Many Requests');
    };

    const summary = await processBggQueue({ limit: 5, delayMs: 1, fetcher: mockFetcher });
    expect(summary.failedCount).toBeGreaterThan(0);
  });

  it('/api/cron/process-bgg-queue should reject requests without valid Bearer CRON_SECRET header', async () => {
    const req = new NextRequest('http://localhost:3001/api/cron/process-bgg-queue', {
      headers: { authorization: 'Bearer bad-secret' },
    });
    const res = await processBggCronHandler(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('/api/cron/process-bgg-queue should execute hydration when valid Bearer token is sent', async () => {
    const secret = process.env.CRON_SECRET || 'your-secure-cron-secret-token';
    const req = new NextRequest('http://localhost:3001/api/cron/process-bgg-queue', {
      method: 'POST',
      headers: { authorization: `Bearer ${secret}` },
    });
    const res = await processBggCronPostHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.processed_count).toBeGreaterThanOrEqual(0);
  });
});
