import { Request, Response, NextFunction } from 'express';
import { getUserFromToken } from '../../src/lib/auth';
import { User } from '../../src/types';

export interface AuthenticatedRequest extends Request {
  user?: User | null;
}

export async function extractUserMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.trishulan_token || req.headers.authorization?.replace('Bearer ', '');
    req.user = await getUserFromToken(token);
  } catch {
    req.user = null;
  }
  next();
}
