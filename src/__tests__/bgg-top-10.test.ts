import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db/db';

describe('US-25: BGG Top 10 & Most Searched Tabbed Landing UI', () => {
  it('should return top 10 games sorted by bgg_rank ascending', () => {
    const top10 = db.getBggTop10();
    expect(top10.length).toBeGreaterThan(0);
    expect(top10.length).toBeLessThanOrEqual(10);
    
    for (let i = 0; i < top10.length - 1; i++) {
      const currentRank = top10[i].bgg_rank ?? 999;
      const nextRank = top10[i + 1].bgg_rank ?? 999;
      expect(currentRank).toBeLessThanOrEqual(nextRank);
    }
  });

  it('should return most searched games sorted by search_count descending', () => {
    const mostSearched = db.getMostSearchedGames();
    expect(mostSearched.length).toBeGreaterThan(0);

    for (let i = 0; i < mostSearched.length - 1; i++) {
      const currentCount = mostSearched[i].search_count ?? 0;
      const nextCount = mostSearched[i + 1].search_count ?? 0;
      expect(currentCount).toBeGreaterThanOrEqual(nextCount);
    }
  });
});
