import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PriceAlertForm } from '@/components/PriceAlertForm';
import { POST as PriceAlertsPost } from '@/app/api/price-alerts/route';
import { NextRequest } from 'next/server';

describe('US-35: Removal of Discount Price Alerts', () => {
  it('does not render any target price input or discount alert creation form in PriceAlertForm', () => {
    const { container } = render(<PriceAlertForm bggId={23} />);

    expect(screen.queryByLabelText(/target price/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /crear alerta/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Crear Alerta de Precio/i)).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it('returns 200/410 deprecation message on POST to /api/price-alerts without enforcing discount alerts', async () => {
    const req = new NextRequest('http://localhost:3001/api/price-alerts', {
      method: 'POST',
      body: JSON.stringify({ bgg_id: 23, target_price: 35, currency: 'EUR' }),
    });
    const res = await PriceAlertsPost(req);
    expect([200, 410]).toContain(res.status);
    const body = await res.json();
    expect(body.message || body.error).toMatch(/removed|wishlist/i);
  });
});
