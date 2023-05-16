import express from 'express';
import { controladorGetAllCarts, controladorNewCart, controladorGetCart, controladorAddToCart, controladorDeleteProductFromCart, controladorUpdateCartProducts, controladorUpdateCartProductQty, controladorDeleteAllProducts } from "../controllers/cart.controller.js";
import { createNewTicket } from '../controllers/ticket.controller.js';
import { requireAuth } from '../controllers/utilities.controller.js';

export const cartRouter = express.Router();

// El usuario tiene role 'user'?
function isUser(req, res, next) {
    if (req.user && req.user.role === 'user') {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

// Solo puede utilizarlas el 'user'
cartRouter.post('/', requireAuth, isUser, controladorNewCart);
cartRouter.post('/:cid/product/:pid', requireAuth, isUser, controladorAddToCart);
cartRouter.delete('/:cid/products/:pid', requireAuth, isUser, controladorDeleteProductFromCart);
cartRouter.put('/:cid', requireAuth, isUser, controladorUpdateCartProducts);
cartRouter.put('/:cid/products/:pid', requireAuth, isUser, controladorUpdateCartProductQty);
cartRouter.delete('/:cid', requireAuth, isUser, controladorDeleteAllProducts);
cartRouter.post('/:cid/purchase', requireAuth, createNewTicket);

// Puede verlas cualquier usuario
cartRouter.get('/', controladorGetAllCarts);
cartRouter.get('/:cid', controladorGetCart);