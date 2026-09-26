import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { listingSchema } from '@/lib/security';
import { getSessionUser } from '@/lib/auth';
import { Listing } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const query = searchParams.get('query')?.toLowerCase();

    const db = await readDb();
    let listings = db.listings;

    if (category) {
      listings = listings.filter(l => l.category === category.toUpperCase());
    }

    if (query) {
      listings = listings.filter(l => 
        l.title.toLowerCase().includes(query) || 
        l.description.toLowerCase().includes(query) ||
        l.location.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ listings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login to post a listing.' }, { status: 401 });
    }

    if (user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Forbidden. Only registered Sellers are authorized to create product listings.' }, { status: 403 });
    }

    const body = await req.json();
    const validated = listingSchema.parse(body);

    const newListing: Listing = {
      id: 'list_' + Math.random().toString(36).substr(2, 9),
      title: validated.title,
      description: validated.description,
      category: validated.category,
      price: validated.price,
      unit: validated.unit,
      location: validated.location,
      sellerId: user.id,
      sellerName: user.companyName || user.name,
      isVerifiedSeller: user.role === 'SELLER' || Boolean(user.verifiedSeller),
      imagePath: validated.imagePath || '/Bento Box/Machinery.png',
      inStock: true,
      createdAt: new Date().toISOString(),
    };

    const db = await readDb();
    db.listings.unshift(newListing);
    await writeDb(db);

    return NextResponse.json({ success: true, listing: newListing });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create listing' }, { status: 400 });
  }
}
