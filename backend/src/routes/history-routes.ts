import { Router } from 'express';
import { z } from 'zod';

import { db } from '../data/db.js';
import { authMiddleware, type AuthenticatedRequest } from '../utils/auth.js';
import { createId } from '../utils/id.js';

const router = Router();
const schema = z.object({ productId: z.string().min(1), note: z.string().max(180).optional() });

router.use(authMiddleware);

router.get('/', (req: AuthenticatedRequest, res) => {
  const items = db.history.filter((item) => item.userId === req.user?.sub).map((item) => ({
    ...item,
    product: db.products.find((product) => product.id === item.productId) || null,
  }));
  res.json(items);
});

router.post('/', (req: AuthenticatedRequest, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Dados inválidos.' });

  const item = { id: createId('history'), userId: req.user!.sub, productId: parsed.data.productId, note: parsed.data.note, scannedAt: new Date().toISOString() };
  db.history.unshift(item);
  res.status(201).json(item);
});

router.patch('/:id', (req: AuthenticatedRequest, res) => {
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Dados inválidos.' });
  const item = db.history.find((history) => history.id === req.params.id && history.userId === req.user?.sub);
  if (!item) return res.status(404).json({ message: 'Registro não encontrado.' });
  Object.assign(item, parsed.data);
  res.json(item);
});

router.delete('/:id', (req: AuthenticatedRequest, res) => {
  const index = db.history.findIndex((history) => history.id === req.params.id && history.userId === req.user?.sub);
  if (index === -1) return res.status(404).json({ message: 'Registro não encontrado.' });
  db.history.splice(index, 1);
  res.status(204).send();
});

export default router;
