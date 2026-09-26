import fs from 'fs/promises';
import path from 'path';
import { User, Listing, RFQ, ChatMessage, MarketPrice, LogisticsBooking, CorporateRequest } from '@/types';

const DB_FILE = path.join(process.cwd(), 'trishulan_db.json');

interface Schema {
  users: User[];
  listings: Listing[];
  rfqs: RFQ[];
  chats: ChatMessage[];
  market_prices: MarketPrice[];
  logistics: LogisticsBooking[];
  corporate_requests: CorporateRequest[];
}

const initialSeedData: Schema = {
  users: [],
  listings: [
    {
      id: 'list_1',
      title: 'TMT Steel Rebar Fe-500D (12mm)',
      description: 'High tensile strength primary steel rebar manufactured under BIS certification. Ideal for heavy infrastructure and construction.',
      category: 'RAW_MATERIALS',
      price: 54500,
      unit: 'Metric Ton',
      location: 'Mumbai, Maharashtra',
      sellerId: 'usr_seller1',
      sellerName: 'Jindal Steel & Power Supplies',
      isVerifiedSeller: true,
      imagePath: '/Bento Box/RawMaterial.png',
      inStock: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'list_2',
      title: 'Automatic CNC 5-Axis Milling Center',
      description: 'High-precision industrial CNC machine for complex metal component manufacturing. Features Siemens controller.',
      category: 'MACHINERY',
      price: 2850000,
      unit: 'Unit',
      location: 'Rajkot, Gujarat',
      sellerId: 'usr_seller2',
      sellerName: 'Apex Machinery Works',
      isVerifiedSeller: true,
      imagePath: '/Bento Box/Machinery.png',
      inStock: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'list_3',
      title: 'Industrial Heavy Duty Hydraulic Cylinders',
      description: 'Double acting hydraulic cylinder with 100mm bore, 500mm stroke, operating pressure 250 Bar.',
      category: 'SPARES',
      price: 18500,
      unit: 'Piece',
      location: 'Coimbatore, Tamil Nadu',
      sellerId: 'usr_seller3',
      sellerName: 'FluidPower Controls',
      isVerifiedSeller: false,
      imagePath: '/Bento Box/SpareAndParts.png',
      inStock: true,
      createdAt: new Date().toISOString(),
    }
  ],
  rfqs: [
    {
      id: 'rfq_1',
      buyerId: 'usr_buyer1',
      buyerName: 'Global Infra Solutions',
      title: 'Bulk Requirement: 50 Metric Tons Structural Steel Pipes',
      category: 'RAW_MATERIALS',
      quantity: '50 MT',
      targetPrice: 52000,
      details: 'Urgent requirement for Grade A ERW steel pipes for water pipeline project in Vizag.',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    }
  ],
  chats: [
    {
      id: 'msg_1',
      senderId: 'usr_buyer1',
      senderName: 'Global Infra Solutions',
      receiverId: 'usr_seller1',
      receiverName: 'Jindal Steel & Power Supplies',
      rfqId: 'rfq_1',
      text: 'Hello, we are interested in placing a bulk order for 50 MT TMT Rebar. Can you offer a discount for immediate dispatch?',
      timestamp: new Date().toISOString(),
    }
  ],
  market_prices: [
    {
      id: 'mp_1',
      commodity: 'Steel Rebar (Fe 500)',
      category: 'Raw Materials',
      currentPrice: 54500,
      unit: 'Metric Ton',
      change24h: 1.4,
      history7d: [53800, 54000, 54100, 54200, 54300, 54400, 54500],
      history30d: [52000, 52500, 53000, 53500, 54000, 54500],
      historicalYear: [
        { date: '2025-10', price: 49000 },
        { date: '2025-11', price: 50200 },
        { date: '2025-12', price: 51000 },
        { date: '2026-01', price: 52400 },
        { date: '2026-02', price: 53100 },
        { date: '2026-03', price: 54500 }
      ],
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'mp_2',
      commodity: 'Polypropylene (PP Granules)',
      category: 'Raw Materials',
      currentPrice: 98200,
      unit: 'Metric Ton',
      change24h: -0.8,
      history7d: [99000, 98900, 98700, 98500, 98400, 98300, 98200],
      history30d: [101000, 100200, 99500, 99000, 98500, 98200],
      historicalYear: [
        { date: '2025-10', price: 104000 },
        { date: '2025-11', price: 102500 },
        { date: '2025-12', price: 101000 },
        { date: '2026-01', price: 99800 },
        { date: '2026-02', price: 99000 },
        { date: '2026-03', price: 98200 }
      ],
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'mp_3',
      commodity: 'CNC Milling Machine (5-Axis)',
      category: 'Machinery',
      currentPrice: 2850000,
      unit: 'Unit',
      change24h: 0.0,
      history7d: [2850000, 2850000, 2850000, 2850000, 2850000, 2850000, 2850000],
      history30d: [2800000, 2820000, 2850000, 2850000],
      historicalYear: [
        { date: '2025-10', price: 2750000 },
        { date: '2026-01', price: 2800000 },
        { date: '2026-03', price: 2850000 }
      ],
      lastUpdated: new Date().toISOString()
    }
  ],
  logistics: [],
  corporate_requests: []
};

export async function readDb(): Promise<Schema> {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data) as Schema;
  } catch (error) {
    await writeDb(initialSeedData);
    return initialSeedData;
  }
}

export async function writeDb(data: Schema): Promise<void> {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
