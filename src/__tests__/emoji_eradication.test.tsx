import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';
import { Toolbar } from '@/components/Toolbar';
import StoreOffersComparisonTable, { ComparisonOffer } from '@/components/StoreOffersComparisonTable';
import { UserAlertsDashboard, AlertItem } from '@/components/UserAlertsDashboard';
import { RegionalStoreToggle } from '@/components/RegionalStoreToggle';
import { RestockAlertButton } from '@/components/RestockAlertButton';

jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  getServerSession: jest.fn(() => Promise.resolve(null)),
}));

// Mock Supabase so Home server component does not wait on network connection
jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockImplementation(() => Promise.resolve({
      data: [
        { bgg_id: 23, name: 'Catan', thumbnail: 'http://img/catan.jpg', weight: 2.3 },
      ],
      error: null,
    })),
    single: jest.fn().mockImplementation(() => Promise.resolve({
      data: null,
      error: { message: 'Not found' },
    })),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

const BANNED_EMOJIS = [
  '🎲', '🔥', '🌍', '💸', '📦', '🇪🇸', '🇵🇹', '🇬🇧', '🇩🇪', '🇺🇸', '🇲🇽', '🇧🇷', '🌐',
  '🏪', '🛡️', '🌱', 'ℹ️', '⭐', '✨', '⚠️', '🔔', '⏳', '⚡', '🔒', '🏷️'
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

  it('eradicates raw unicode emojis from RegionalStoreToggle (src/components/RegionalStoreToggle.tsx)', () => {
    const { container } = render(<RegionalStoreToggle />);
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

import { SearchBar } from '@/components/SearchBar';
import { CartOptimizerPanel } from '@/components/CartOptimizerPanel';
import { StoreReviewPanel } from '@/components/StoreReviewPanel';
import { AdminStoreList } from '@/components/AdminStoreList';
import { CurrencyManager } from '@/components/CurrencyManager';
import { AdminQueueMonitor } from '@/components/AdminQueueMonitor';
import { FeedDiagnosticsPanel } from '@/components/FeedDiagnosticsPanel';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { ShippingMatrix } from '@/components/ShippingMatrix';
import MerchantOnboardPage from '@/app/merchant/onboard/page';

describe('Issue #47 (US-37): Complete System-Wide Emoji Eradication across Admin, Merchant, and Catalog UI', () => {
  it('eradicates raw unicode emojis from SearchBar', () => {
    const { container } = render(<SearchBar />);
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from CartOptimizerPanel', () => {
    const { container } = render(
      <CartOptimizerPanel initialGames={[{ bgg_id: 1, name: 'Test Game', thumbnail: null }]} />
    );
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from StoreReviewPanel', () => {
    const { container } = render(
      <StoreReviewPanel
        storeId="1"
        storeName="Test Store"
        initialReviews={[]}
        initialAvgRating={4.5}
        initialTagCounts={{ 'Esquinas Protegidas': 5 }}
      />
    );
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from AdminStoreList', () => {
    const { container } = render(
      <AdminStoreList
        initialStores={[{ id: 's1', name: 'Store 1', verified: true, owner_email: 'admin@meeple.com' }]}
      />
    );
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from CurrencyManager', () => {
    const { container } = render(
      <CurrencyManager
        initialRates={[{ currency: 'USD', rate: 1.08, enabled: true, updated_at: '2026-07-01T00:00:00Z' }]}
      />
    );
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from AdminQueueMonitor', () => {
    const { container } = render(
      <AdminQueueMonitor
        initialItems={[{ id: 'q1', store_id: 's1', ean: '123', title: 'Test Game', store_product_url: 'http://example.com', status: 'pending', created_at: '2026-07-01' }]}
      />
    );
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from FeedDiagnosticsPanel', () => {
    const { container } = render(
      <FeedDiagnosticsPanel
        store={{ id: 's1', name: 'Store 1', feed_status: 'OK', feed_last_processed_count: 10, feed_last_matched_count: 8, feed_last_unmatched_count: 2, google_shopping_feed_url: 'http://example.com/feed.xml' }}
      />
    );
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from OnboardingWizard', () => {
    const { container } = render(<OnboardingWizard />);
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from ShippingMatrix', () => {
    const { container } = render(
      <ShippingMatrix
        storeId="s1"
        initialRates={[{ destination_country: 'ES', flat_rate: 4.99, free_shipping_threshold: 50 }]}
      />
    );
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from MerchantOnboardPage', () => {
    const { container } = render(<MerchantOnboardPage />);
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });
});

import AdminDashboardPage from '@/app/admin/dashboard/page';
import AdminCurrencyPage from '@/app/admin/currency/page';
import AdminQueuePage from '@/app/admin/queue/page';
import MerchantDiagnosticsPage from '@/app/merchant/diagnostics/page';
import MerchantShippingPage from '@/app/merchant/shipping/page';

describe('Restricted access pages and admin server components zero emoji compliance', () => {
  it('eradicates raw unicode emojis from AdminDashboardPage unauthenticated state', async () => {
    const jsx = await AdminDashboardPage();
    const { container } = render(jsx);
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from AdminCurrencyPage unauthenticated state', async () => {
    const jsx = await AdminCurrencyPage();
    const { container } = render(jsx);
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from AdminQueuePage unauthenticated state', async () => {
    const jsx = await AdminQueuePage();
    const { container } = render(jsx);
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from MerchantDiagnosticsPage unauthenticated state', async () => {
    const jsx = await MerchantDiagnosticsPage();
    const { container } = render(jsx);
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });

  it('eradicates raw unicode emojis from MerchantShippingPage unauthenticated state', async () => {
    const jsx = await MerchantShippingPage();
    const { container } = render(jsx);
    BANNED_EMOJIS.forEach((emoji) => {
      expect(container.textContent || '').not.toContain(emoji);
    });
  });
});
