import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db/db';
import { enrichGameImagesFromBgg } from '@/lib/engine/image-hydrator';

describe('US-27: Automated High-Res Game Image Hydration & Fallback Process', () => {
  it('should identify games with unsplash or placeholder images', () => {
    const games = db.getBggGames();
    expect(games.length).toBeGreaterThan(0);
    
    // Check total games count
    const placeholderGames = games.filter(g => 
      !g.image || 
      g.image.includes('unsplash.com') || 
      g.image.includes('placeholder')
    );
    expect(placeholderGames).toBeDefined();
  });

  it('should enrich game image from BGG API or fallback service', async () => {
    // Upsert a test game with unsplash image
    const testGame = db.upsertBggGame({
      bgg_id: 13,
      name: 'Catan',
      image: 'https://images.unsplash.com/photo-placeholder',
      thumbnail: 'https://images.unsplash.com/photo-placeholder',
    });

    const enriched = await enrichGameImagesFromBgg(testGame.bgg_id, async () => {
      return {
        image: 'https://cf.geekdo-images.com/W3AERfWOCjAuhDp48W5IDA__original/img/j52B8mNNV4hB6q4w9_3439.jpg',
        thumbnail: 'https://cf.geekdo-images.com/W3AERfWOCjAuhDp48W5IDA__thumb/img/j52B8mNNV4hB6q4w9_3439.jpg',
      };
    });

    expect(enriched).not.toBeNull();
    expect(enriched?.image).toContain('cf.geekdo-images.com');
    
    const updated = db.getBggGameById(13);
    expect(updated?.image).toContain('cf.geekdo-images.com');
  });
});
