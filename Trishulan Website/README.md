# Trishulan Industrial B2B Platform

> **Architecture**: Next.js frontend | Express + PostgreSQL backend | Prisma ORM

---

## Project Structure

```
Trishulan Website/
├── backend/     ← Express.js REST API + Prisma + PostgreSQL
└── frontend/    ← Next.js 16 App Router
```

---

## Quick Start

### 1. Setup PostgreSQL

Create a database named `trishulan_db` in your local PostgreSQL instance.

### 2. Backend

```bash
cd backend
npm install
# Edit .env — set DATABASE_URL to your PostgreSQL connection string
npm run generate      # Generate Prisma client
npm run db:push       # Push schema to DB (dev)
npm run db:seed       # Seed demo data
npm run dev           # Start backend on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev           # Start Next.js on http://localhost:3000
```

---

## API Base URL

All frontend API calls proxy through Next.js rewrites to `http://localhost:5000/api`.

| Route                     | Method | Description              |
|---------------------------|--------|--------------------------|
| `/api/auth/register`      | POST   | Register new user        |
| `/api/auth/login`         | POST   | Login (JWT or Firebase)  |
| `/api/auth/logout`        | POST   | Clear auth cookie        |
| `/api/auth/me`            | GET    | Current session user     |
| `/api/auth/profile`       | PUT    | Update profile           |
| `/api/listings`           | GET    | List products            |
| `/api/listings`           | POST   | Create listing (Seller)  |
| `/api/rfq`                | GET    | List RFQs                |
| `/api/rfq`                | POST   | Submit RFQ (Buyer)       |
| `/api/chat`               | GET    | Get messages             |
| `/api/chat`               | POST   | Send message             |
| `/api/market`             | GET    | Live market prices       |
| `/api/subscription`       | POST   | Update subscription tier |
| `/api/kyc/verify-gstin`   | POST   | Verify GSTIN             |
| `/api/kyc/verify-pan`     | POST   | Verify PAN               |

---

## Demo Credentials (after seeding)

| Role   | Email                      | Password   |
|--------|----------------------------|------------|
| Seller | seller@trishulan.com       | seller123  |
| Buyer  | buyer@trishulan.com        | buyer123   |
