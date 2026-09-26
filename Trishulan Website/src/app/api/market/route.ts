import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    const tier = user ? user.subscriptionTier : 'BASIC';

    const db = await readDb();
    const marketPrices = db.market_prices.map(item => {
      if (tier === 'BASIC') {
        return {
          id: item.id,
          commodity: item.commodity,
          category: item.category,
          currentPrice: item.currentPrice,
          unit: item.unit,
          change24h: item.change24h,
          lastUpdated: item.lastUpdated,
          lockedMessage: 'Upgrade to Growth Plan (₹1,999/mo) to unlock 7-Day & 30-Day price trends.'
        };
      }

      if (tier === 'GROWTH') {
        return {
          id: item.id,
          commodity: item.commodity,
          category: item.category,
          currentPrice: item.currentPrice,
          unit: item.unit,
          change24h: item.change24h,
          history7d: item.history7d,
          history30d: item.history30d,
          lastUpdated: item.lastUpdated,
          lockedMessage: 'Upgrade to Enterprise Plan (₹8,999/mo) to unlock multi-year Historical Data & Predictive Analyzer.'
        };
      }

      // ENTERPRISE
      return item;
    });

    return NextResponse.json({ tier, marketPrices });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
