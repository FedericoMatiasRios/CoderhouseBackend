import express from 'express';
import { webRouter } from '../controllers/base.controller.js';
import { requireAuth } from "../controllers/utilities.controller.js";

export const viewRouter = express.Router();

viewRouter.use('/', requireAuth, webRouter);
viewRouter.use('/realtimeproducts', webRouter);
viewRouter.use('/products', webRouter);
viewRouter.use('/products/:pid', webRouter);
viewRouter.use('/carts/:cid', webRouter);
viewRouter.post('/carts/:cid/purchase', webRouter);