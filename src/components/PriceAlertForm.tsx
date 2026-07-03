'use client';

import React from 'react';

interface Props {
  bggId: number;
}

export function PriceAlertForm({ bggId }: Props) {
  // Discount target price alerts have been removed per US-35 / Issue #42.
  // This component returns null so no discount alert form is rendered.
  return null;
}
