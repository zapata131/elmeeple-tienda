import { describe, it, expect } from 'vitest';
import { parseGoogleXmlFeed } from '@/lib/engine/feed-parser';
import { INITIAL_STORES } from '@/lib/db/seed-data';

describe('US-23 Store Feed Format & XML Validation', () => {
  it('should verify that all 51 stores have valid Shopify Atom XML feed URL signatures', () => {
    INITIAL_STORES.forEach((store) => {
      expect(store.feed_url).toBeDefined();
      expect(store.feed_url).toMatch(/^https:\/\/[a-z0-9.-]+\/collections\/all\.atom$/);
    });
  });

  it('should correctly parse sample Shopify Atom XML feeds with entry nodes', () => {
    const sampleAtomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>https://fichaydado.com/collections/all.atom</id>
  <title>Ficha y Dado</title>
  <entry>
    <id>https://fichaydado.com/products/catan</id>
    <title>Catan, Juego de Mesa</title>
    <link rel="alternate" type="text/html" href="https://fichaydado.com/products/catan"/>
    <g:price>949.00 MXN</g:price>
    <g:availability>in stock</g:availability>
  </entry>
</feed>`;

    const items = parseGoogleXmlFeed(sampleAtomXml);
    expect(items.length).toBe(1);
    expect(items[0].title).toBe('Catan, Juego de Mesa');
    expect(items[0].price).toBe(949.00);
    expect(items[0].productUrl).toBe('https://fichaydado.com/products/catan');
  });
});
