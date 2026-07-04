import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';
import { Toolbar } from '@/components/Toolbar';
import StoreOffersComparisonTable, { ComparisonOffer } from '@/components/StoreOffersComparisonTable';
import { UserAlertsDashboard, AlertItem } from '@/components/UserAlertsDashboard';
import { RestockAlertButton } from '@/components/RestockAlertButton';

// Mock Supabase so Home server component does not wait on network connection
jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockImplementation(() => Promise.resolve({
      data: [
        { bgg_id: 23, name: 'Catan', thumbnail: 'http://img/catan.jpg', weight: 2.3 },
      ],
      error: null,
    })),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

const BANNED_EMOJIS = [
  '🎲', '🔥', '🌍', '💸', '📦', '🇪🇸', '🇵🇹', '🇬🇧', '🇩🇪', '🇺🇸', '🇲🇽', '🇧🇷', '🌐',
  '🏪', '🛡️', '🌱', 'ℹ️', '★', '✨', '⚠️', '🔔', '⏳', '⚡'
];

describe('US-34 (Issue #37): System-Wide Vector SVGs & Emoji Eradication', () => {
  it('eradicates raw unicode emojis from Home (src/app/page.tsx) and uses clean vector/text elements', async () => {
    const jsx = await Home();
    const { container } = render(jsx);
    const textContent = container.textContent || '';

    BANNED_EMOJIS.forEach((emoji) => {
      expect(textContent).not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from Toolbar (src/components/Toolbar.tsx)', () => {
    const { container } = render(<Toolbar />);
    const textContent = container.textContent || '';

    BANNED_EMOJIS.forEach((emoji) => {
      expect(textContent).not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from StoreOffersComparisonTable (src/components/StoreOffersComparisonTable.tsx)', () => {
    const mockOffers: ComparisonOffer[] = [
      {
        id: '1',
        store_id: 's1',
        store_name: 'Store MX',
        store_logo: null,
        store_country: 'MX',
        rating: 4.8,
        review_count: 50,
        price: 30,
        stock: 5,
        edition_language: 'es',
        shippingCost: 5,
        totalCost: 35,
      },
      {
        id: '2',
        store_id: 's2',
        store_name: 'Store US',
        store_logo: null,
        store_country: 'US',
        rating: 4.5,
        review_count: 20,
        price: 28,
        stock: 5,
        edition_language: 'en',
        shippingCost: 15,
        totalCost: 43,
      }
    ];

    const { container } = render(
      <StoreOffersComparisonTable
        offers={mockOffers}
        bggId={500}
        gameName="Azul"
        selectedCountry="ES"
      />
    );

    // Toggle off domestic only so international banner and international store show up
    const toggleSwitch = screen.getByRole('switch', { name: /Solo tiendas de mi país/i });
    fireEvent.click(toggleSwitch);

    const textContent = container.textContent || '';
    BANNED_EMOJIS.forEach((emoji) => {
      expect(textContent).not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from UserAlertsDashboard (src/components/UserAlertsDashboard.tsx)', () => {
    const mockAlerts: AlertItem[] = [
      {
        id: 'al-1',
        bggId: 23,
        gameName: 'Catan',
        thumbnail: '',
        currentLowestPrice: 28,
        createdAt: '2026-07-01',
      }
    ];

    const { container } = render(
      <UserAlertsDashboard initialAlerts={mockAlerts} userEmail="player@meeple.com" />
    );

    const textContent = container.textContent || '';
    BANNED_EMOJIS.forEach((emoji) => {
      expect(textContent).not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from RestockAlertButton (src/components/RestockAlertButton.tsx)', () => {
    const { container: containerUnsub } = render(
      <RestockAlertButton bggId={13} gameName="Catan" userEmail="player@meeple.com" />
    );
    BANNED_EMOJIS.forEach((emoji) => {
      expect(containerUnsub.textContent || '').not.toContain(emoji);
    });
  });
});
