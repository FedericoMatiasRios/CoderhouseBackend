import express from 'express';
import { controladorProductsGet, controladorId, controladorProductsPost, controladorDeleteProduct, controladorUpdateProduct } from "../controllers/productController.js";

export const productRouter = express.Router();

productRouter.get('/', controladorProductsGet);
productRouter.get('/:pid', controladorId);
productRouter.post('/', controladorProductsPost);
productRouter.put('/:pid', controladorUpdateProduct);
productRouter.delete('/:pid', controladorDeleteProduct);