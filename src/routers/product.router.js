import express from 'express';
import { controladorProductsGet, controladorId, controladorProductsPost, controladorDeleteProduct, controladorUpdateProduct } from "../controllers/product.controller.js";
import { requireAuth } from '../controllers/utilities.controller.js';

export const productRouter = express.Router();

// El usuario tiene role 'admin'?
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

// Solo puede utilizarlas el 'admin'
productRouter.post('/', requireAuth, isAdmin, controladorProductsPost);
productRouter.put('/:pid', requireAuth, isAdmin, controladorUpdateProduct);
productRouter.delete('/:pid', requireAuth, isAdmin, controladorDeleteProduct);

// Puede verlas cualquier usuario
productRouter.get('/', controladorProductsGet);
productRouter.get('/:pid', controladorId);
