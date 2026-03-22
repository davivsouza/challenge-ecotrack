import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';

const secret = process.env.JWT_SECRET || 'ecotrack-dev-secret';

export interface AuthPayload {
  sub: string;
  email: string;
  name: string;
}

export function signToken(payload: AuthPayload) {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret) as AuthPayload;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token ausente.' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido.' });
  }
}
