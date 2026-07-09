import { verifyStoreOfferUrl } from '@/utils/url_product_audit_worker';

describe('US-74: Automated Store Offer URL & Product Title Cross-Matching Audit', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeAll(() => {
    originalFetch = globalThis.fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('validates healthy product links with matching titles', async () => {
    globalThis.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('.json')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ product: { title: 'Catan (Edición en Español)' } }),
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200 } as Response);
    });

    const res = await verifyStoreOfferUrl('https://store.com/products/catan', 'Catan');
    expect(res.isValidLink).toBe(true);
    expect(res.isCorrectProductMatch).toBe(true);
    expect(res.productTitleFound).toBe('Catan (Edición en Español)');
  });

  it('detects broken HTTP 404 links', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const res = await verifyStoreOfferUrl('https://store.com/products/non-existent-game', 'Catan');
    expect(res.isValidLink).toBe(false);
    expect(res.isCorrectProductMatch).toBe(false);
    expect(res.failureReason).toContain('HTTP 404');
  });

  it('detects expansion mis-attribution under base games', async () => {
    globalThis.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('.json')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ product: { title: 'Carcassonne: Niebla en Carcassonne' } }),
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200 } as Response);
    });

    const res = await verifyStoreOfferUrl('https://store.com/products/niebla-carcassonne', 'Carcassonne');
    expect(res.isValidLink).toBe(true);
    expect(res.isCorrectProductMatch).toBe(false);
    expect(res.failureReason).toContain('expansion/accessory');
  });

  it('detects product title mismatches between target game and store page', async () => {
    globalThis.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('.json')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ product: { title: 'Catan (Juego Base)' } }),
        } as Response);
      }
      return Promise.resolve({ ok: true, status: 200 } as Response);
    });

    const res = await verifyStoreOfferUrl('https://store.com/products/catan', 'Wingspan');
    expect(res.isValidLink).toBe(true);
    expect(res.isCorrectProductMatch).toBe(false);
    expect(res.failureReason).toContain('Title mismatch');
  });
});
