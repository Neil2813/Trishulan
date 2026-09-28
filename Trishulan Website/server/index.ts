import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { extractUserMiddleware } from './middleware/authMiddleware';

import helloRouter from './routes/hello';
import authRouter from './routes/auth';
import listingsRouter from './routes/listings';
import rfqRouter from './routes/rfq';
import chatRouter from './routes/chat';
import marketRouter from './routes/market';
import subscriptionRouter from './routes/subscription';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(extractUserMiddleware);

// API Routes
app.use('/api/hello', helloRouter);
app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/rfq', rfqRouter);
app.use('/api/chat', chatRouter);
app.use('/api/market', marketRouter);
app.use('/api/subscription', subscriptionRouter);

// Health check root route
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Trishulan Dedicated Express Backend Server Running' });
});

// 404 Handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'API Endpoint not found' });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Express Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`⚡ Trishulan Dedicated Express Backend running on port ${PORT}`);
    console.log(`🌐 Base API URL: http://localhost:${PORT}/api`);
    console.log(`====================================================`);
  });
}

export default app;
