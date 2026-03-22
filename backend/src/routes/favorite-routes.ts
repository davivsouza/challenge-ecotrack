import { Router } from 'express';
import { z } from 'zod';

import { db } from '../data/db.js';
import { authMiddleware, type AuthenticatedRequest } from '../utils/auth.js';
import { createId } from '../utils/id.js';

const router = Router();
const schema = z.object({ productId: z.string().min(1), note: z.string().max(180).optional() });

router.use(authMiddleware);

router.get('/', (req: AuthenticatedRequest, res) => {
  const items = db.favorites.filter((item) => item.userId === req.user?.sub).map((item) => ({
    ...item,
    product: db.products.find((product) => product.id === item.productId) || null,
  }));
  res.json(items);
});

router.post('/', (req: AuthenticatedRequest, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Dados inválidos.' });
  const existing = db.favorites.find((item) => item.userId === req.user?.sub && item.productId === parsed.data.productId);
  if (existing) return res.status(409).json({ message: 'Produto já está nos favoritos.' });

  const item = { id: createId('favorite'), userId: req.user!.sub, productId: parsed.data.productId, note: parsed.data.note, createdAt: new Date().toISOString() };
  db.favorites.unshift(item);
  res.status(201).json(item);
});

router.patch('/:id', (req: AuthenticatedRequest, res) => {
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Dados inválidos.' });
  const item = db.favorites.find((favorite) => favorite.id === req.params.id && favorite.userId === req.user?.sub);
  if (!item) return res.status(404).json({ message: 'Favorito não encontrado.' });
  Object.assign(item, parsed.data);
  res.json(item);
});

router.delete('/:id', (req: AuthenticatedRequest, res) => {
  const index = db.favorites.findIndex((favorite) => favorite.id === req.params.id && favorite.userId === req.user?.sub);
  if (index === -1) return res.status(404).json({ message: 'Favorito não encontrado.' });
  db.favorites.splice(index, 1);
  res.status(204).send();
});

export default router;
