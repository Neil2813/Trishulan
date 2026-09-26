import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { SubscriptionTier } from '@/types';

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login to manage subscription.' }, { status: 401 });
    }

    const { tier } = await req.json();
    if (!['BASIC', 'GROWTH', 'ENTERPRISE'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid subscription tier.' }, { status: 400 });
    }

    const db = await readDb();
    const dbUser = db.users.find(u => u.id === user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    dbUser.subscriptionTier = tier as SubscriptionTier;
    await writeDb(db);

    return NextResponse.json({ success: true, tier });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
