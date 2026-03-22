import { Router } from 'express';
import { z } from 'zod';

import { db } from '../data/db.js';
import { createId } from '../utils/id.js';
import { authMiddleware, signToken, type AuthenticatedRequest } from '../utils/auth.js';

const router = Router();

const authSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

router.post('/register', (req, res) => {
  const parsed = authSchema.extend({ name: z.string().min(3) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Dados inválidos.', issues: parsed.error.flatten() });

  const existing = db.users.find((user) => user.email.toLowerCase() === parsed.data.email.toLowerCase());
  if (existing) return res.status(409).json({ message: 'Email já cadastrado.' });

  const user = {
    id: createId('user'),
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  const token = signToken({ sub: user.id, email: user.email, name: user.name });
  return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.post('/login', (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Dados inválidos.' });

  const user = db.users.find((item) => item.email.toLowerCase() === parsed.data.email.toLowerCase() && item.password === parsed.data.password);
  if (!user) return res.status(401).json({ message: 'Email ou senha incorretos.' });

  const token = signToken({ sub: user.id, email: user.email, name: user.name });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.get('/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = db.users.find((item) => item.id === req.user?.sub);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
  return res.json({ id: user.id, name: user.name, email: user.email });
});

export default router;
