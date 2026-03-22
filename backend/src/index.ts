import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import authRoutes from './routes/auth-routes.js';
import favoriteRoutes from './routes/favorite-routes.js';
import historyRoutes from './routes/history-routes.js';
import productRoutes from './routes/product-routes.js';

const app = express();
const port = Number(process.env.PORT || 3333);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/history', historyRoutes);
app.use('/favorites', favoriteRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`EcoTrack backend running on http://0.0.0.0:${port}`);
});
