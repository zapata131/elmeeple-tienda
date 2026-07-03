export function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  ratesMap: Map<string, number>
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Get rates relative to EUR (Base 1.0)
  const fromRate = ratesMap.get(fromCurrency) ?? 1.0;
  const toRate = ratesMap.get(toCurrency) ?? 1.0;

  // Convert amount to EUR first, then from EUR to target currency
  const amountInEur = amount / fromRate;
  return amountInEur * toRate;
}

export function isRatesCacheStale(updatedAt: string): boolean {
  const updatedDate = new Date(updatedAt).getTime();
  if (isNaN(updatedDate)) {
    return true;
  }

  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  return Date.now() - updatedDate > twentyFourHoursMs;
}
