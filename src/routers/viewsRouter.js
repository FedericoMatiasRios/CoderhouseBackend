import express from 'express';
import { webRouter, requireAuth } from '../controllers/controllers.js';

export const viewRouter = express.Router();

viewRouter.use('/', requireAuth, webRouter);
viewRouter.use('/realtimeproducts', webRouter);
viewRouter.use('/products', webRouter);
viewRouter.use('/products/:pid', webRouter);
viewRouter.use('/carts/:cid', webRouter);