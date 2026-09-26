import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { rfqSchema } from '@/lib/security';
import { getSessionUser } from '@/lib/auth';
import { RFQ } from '@/types';

export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json({ rfqs: db.rfqs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login to post an RFQ.' }, { status: 401 });
    }

    if (user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden. Only registered Buyers are authorized to submit RFQs and procurement requirements.' }, { status: 403 });
    }

    const body = await req.json();
    const validated = rfqSchema.parse(body);

    const newRfq: RFQ = {
      id: 'rfq_' + Math.random().toString(36).substr(2, 9),
      buyerId: user.id,
      buyerName: user.companyName || user.name,
      title: validated.title,
      category: validated.category,
      quantity: validated.quantity,
      targetPrice: validated.targetPrice,
      details: validated.details,
      status: 'OPEN',
      documentUrl: body.documentUrl || undefined,
      createdAt: new Date().toISOString(),
    };

    const db = await readDb();
    db.rfqs.unshift(newRfq);
    await writeDb(db);

    return NextResponse.json({ success: true, rfq: newRfq });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to submit RFQ' }, { status: 400 });
  }
}
