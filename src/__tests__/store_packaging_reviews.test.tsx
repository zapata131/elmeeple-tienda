import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreReviewPanel } from '@/components/StoreReviewPanel';
import { GET as ReviewsGet, POST as ReviewsPost } from '@/app/api/store/reviews/route';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('US-22: Store Packaging Vibe Tags & Reviews', () => {
  let mockClient: Record<string, jest.Mock>;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    jest.clearAllMocks();
  });

  describe('API Endpoints (/api/store/reviews)', () => {
    it('returns 400 if storeId is missing on GET', async () => {
      const req = new NextRequest('http://localhost:3001/api/store/reviews');
      const res = await ReviewsGet(req);
      expect(res.status).toBe(400);
    });

    it('returns store reviews and calculated average rating on GET', async () => {
      mockClient.eq.mockImplementationOnce(() => ({
        data: [
          { id: 'r1', store_id: 's-101', user_name: 'Sofía', rating: 5, tags: ['Esquinas Protegidas', 'Caja Doble'], comment: 'Excelente embalaje', created_at: '2026-07-02' },
          { id: 'r2', store_id: 's-101', user_name: 'Carlos', rating: 4, tags: ['Envío Rápido'], comment: 'Llegó en 24h', created_at: '2026-07-01' },
        ],
        error: null,
      }));

      const req = new NextRequest('http://localhost:3001/api/store/reviews?storeId=s-101');
      const res = await ReviewsGet(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.averageRating).toBe(4.5);
      expect(body.reviews.length).toBe(2);
      expect(body.tagCounts['Esquinas Protegidas']).toBe(1);
    });

    it('inserts a new review on POST', async () => {
      mockClient.insert.mockImplementationOnce(() => ({
        error: null,
      }));

      const req = new NextRequest('http://localhost:3001/api/store/reviews', {
        method: 'POST',
        body: JSON.stringify({
          storeId: 's-101',
          userName: 'Elena',
          rating: 5,
          tags: ['Esquinas Protegidas'],
          comment: 'Muy bien protegido todo.',
        }),
      });
      const res = await ReviewsPost(req);
      expect(res.status).toBe(200);
    });
  });

  describe('StoreReviewPanel Component UI', () => {
    it('renders existing reviews and submits new rating with vibe tags', async () => {
      const initialReviews = [
        {
          id: 'r1',
          userName: 'Sofía',
          rating: 5,
          tags: ['Esquinas Protegidas'],
          comment: 'Perfecto',
          createdAt: '2026-07-02',
        },
      ];

      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      );

      render(
        <StoreReviewPanel
          storeId="s-101"
          storeName="Zygomatic España"
          initialReviews={initialReviews}
          initialAvgRating={5}
          initialTagCounts={{ 'Esquinas Protegidas': 1 }}
        />
      );

      expect(screen.getByText('Zygomatic España - Valoraciones y vibe tags')).toBeInTheDocument();
      expect(screen.getAllByText(/Esquinas Protegidas/i).length).toBeGreaterThan(0);

      // Submit new review
      const nameInput = screen.getByPlaceholderText(/ej. sofía gamer/i);
      fireEvent.change(nameInput, { target: { value: 'Elena Gamer' } });

      const commentInput = screen.getByPlaceholderText(/escribe tu experiencia sobre el embalaje/i);
      fireEvent.change(commentInput, { target: { value: 'Todo genial' } });

      const tagBtn = screen.getByText(/Caja Doble/i);
      fireEvent.click(tagBtn);

      const submitBtn = screen.getByText(/Publicar Valoración/i);
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/store/reviews', expect.objectContaining({ method: 'POST' }));
      });
    });
  });
});
