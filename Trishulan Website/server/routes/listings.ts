import { Router } from 'express';
import { readDb, writeDb } from '../../src/lib/db';
import { listingSchema } from '../../src/lib/security';
import { getUserFromToken } from '../../src/lib/auth';
import { Listing } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/listings
router.get('/', async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const query = (req.query.query as string | undefined)?.toLowerCase();

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

    return res.json({ listings });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/listings
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user || await getUserFromToken(req.cookies?.trishulan_token || req.headers.authorization?.replace('Bearer ', ''));
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Please login to post a listing.' });
    }

    if (user.role !== 'SELLER') {
      return res.status(403).json({ error: 'Forbidden. Only registered Sellers are authorized to create product listings.' });
    }

    const body = req.body;
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

    return res.json({ success: true, listing: newListing });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to create listing' });
  }
});

export default router;
