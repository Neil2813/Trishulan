export type UserRole = 'BUYER' | 'SELLER';
export type AuthProvider = 'JWT' | 'FIREBASE';
export type SubscriptionTier = 'BASIC' | 'GROWTH' | 'ENTERPRISE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  authProvider: AuthProvider;
  companyName?: string;
  phone?: string;
  gstNumber?: string;
  industrySector?: string;
  address?: string;
  city?: string;
  state?: string;
  verifiedSeller?: boolean;
  subscriptionTier: SubscriptionTier;
  chatPublicKey?: string | null;
  createdAt: string;
}

export type ListingCategory = 'RAW_MATERIALS' | 'MACHINERY' | 'SPARES';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
  price: number;
  unit: string;
  location: string;
  sellerId: string;
  sellerName: string;
  isVerifiedSeller: boolean;
  imagePath: string;
  inStock: boolean;
  createdAt: string;
}

export type RFQStatus = 'OPEN' | 'IN_NEGOTIATION' | 'COMPLETED' | 'CANCELLED';

export interface RFQ {
  id: string;
  buyerId: string;
  buyerName: string;
  title: string;
  category: ListingCategory;
  quantity: string;
  targetPrice: number;
  details: string;
  status: RFQStatus;
  documentUrl?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  rfqId?: string | null;
  listingId?: string | null;
  text: string;
  isEncrypted?: boolean;
  senderKey?: string | null;
  receiverKey?: string | null;
  read?: boolean;
  attachmentUrl?: string | null;
  timestamp: string;
}

export interface ChatPartner {
  id: string;
  name: string;
  companyName?: string | null;
  role: UserRole;
  city?: string | null;
  state?: string | null;
  verifiedSeller?: boolean;
  chatPublicKey?: string | null;
}

export interface ChatConversation {
  partner: ChatPartner;
  lastMessage: ChatMessage;
  unread: number;
}

export interface ChatListingCard {
  id: string;
  title: string;
  price: number;
  unit: string;
  location: string;
  category: ListingCategory;
  imagePath: string;
}

export interface HistoricalPoint {
  date: string;
  price: number;
}

export interface MarketPrice {
  id: string;
  commodity: string;
  category: string;
  currentPrice: number;
  unit: string;
  change24h: number;
  history7d: number[];
  history30d: number[];
  historicalYear: HistoricalPoint[];
  lastUpdated: string;
  dataSource?: string;
}

export type LogisticsServiceType = 'TRANSPORT' | 'PACKING' | 'INSURANCE' | 'WORKFORCE';

export interface LogisticsBooking {
  id: string;
  userId: string;
  userName: string;
  serviceType: LogisticsServiceType;
  origin: string;
  destination: string;
  details: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED';
  createdAt: string;
}

export type CorporateServiceType = 'TRADEMARK' | 'FIRM_REGISTRATION';

export interface CorporateRequest {
  id: string;
  userId: string;
  userName: string;
  companyName: string;
  serviceType: CorporateServiceType;
  entityType?: 'MSME' | 'PvtLtd' | 'LLP' | 'Proprietorship';
  details: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'PROCESSING' | 'COMPLETED';
  createdAt: string;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  transactionFee: string;
  marketDataDepth: string;
  trustVisibility: string;
  logisticsAccess: string;
  customerSupport: string;
}
