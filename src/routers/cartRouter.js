import express from 'express';
import { controladorGetAllCarts, controladorNewCart, controladorGetCart, controladorAddToCart, controladorDeleteProductFromCart, controladorUpdateCartProducts, controladorUpdateCartProductQty, controladorDeleteAllProducts } from "../controllers/cartController.js";

export const cartRouter = express.Router();

cartRouter.get('/', controladorGetAllCarts);
cartRouter.post('/', controladorNewCart);
cartRouter.get('/:cid', controladorGetCart);
cartRouter.post('/:cid/product/:pid', controladorAddToCart);
cartRouter.delete('/:cid/products/:pid', controladorDeleteProductFromCart);
cartRouter.put('/:cid', controladorUpdateCartProducts);
cartRouter.put('/:cid/products/:pid', controladorUpdateCartProductQty);
cartRouter.delete('/:cid', controladorDeleteAllProducts);
