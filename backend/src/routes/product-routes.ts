import { Router } from 'express';
import { productService } from '../services/product-service.js';

const router = Router();

router.get('/', async (req, res) => {
  const products = await productService.list(typeof req.query.search === 'string' ? req.query.search : undefined);
  res.json(products);
});

router.get('/barcode/:barcode', async (req, res) => {
  const product = await productService.findByBarcode(req.params.barcode);
  if (!product) return res.status(404).json({ message: 'Produto não encontrado.' });
  res.json(product);
});

router.get('/:id', async (req, res) => {
  const product = await productService.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Produto não encontrado.' });
  res.json(product);
});

export default router;
