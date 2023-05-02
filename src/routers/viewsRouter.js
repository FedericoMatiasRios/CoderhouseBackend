import express from 'express';
import { webRouter } from '../controllers/baseControllers.js';
import { requireAuth } from "../controllers/utilitiesController.js";

export const viewRouter = express.Router();

viewRouter.use('/', requireAuth, webRouter);
viewRouter.use('/realtimeproducts', webRouter);
viewRouter.use('/products', webRouter);
viewRouter.use('/products/:pid', webRouter);
viewRouter.use('/carts/:cid', webRouter);