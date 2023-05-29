import { cartDAO } from '../dao/mongo/models/cart.model.js';

// Controladores Carts
export async function controladorGetAllCarts(request, response) {
    try {
        let carts = await cartDAO.getAll();
        const limit = parseInt(request.query.limit);
        // products = JSON.parse(products);
        req.logger.info(carts);
        if (limit) {
            carts = carts.slice(0, limit);
        }
        response.json(carts);
        // http://127.0.0.1:8080/products?limit=2
    } catch (err) {
        req.logger.error(err);
    }
}
export async function controladorNewCart(request, response) {
    try {
        // await cartDAO.firstTime();
        await cartDAO.add({ products: [] });
        response.status(201).send('New cart created!');
    } catch (err) {
        req.logger.error(err);
    }
}
export async function controladorGetCart(request, response) {
    try {
        let cart = await cartDAO.getByIdPopulate(request.params.cid);
        response.json(cart);
    } catch (err) {
        req.logger.error(err);
    }
}
export async function controladorAddToCart(request, response) {
    try {
        // await cartDAO.firstTime();
        await cartDAO.addToCart(request.params.cid, { product: request.params.pid });
        response.status(201).send('Product: ' + request.params.pid + ', added in Cart: ' + request.params.cid);
    } catch (err) {
        req.logger.error(err);
    }
}
export async function controladorDeleteProductFromCart(request, response) {
    try {
        const result = await cartDAO.deleteProductFromCart(request.params.cid, request.params.pid);
        if (result.nModified === 0) {
            response.status(404).send('Product not found in cart!');
        } else {
            response.status(201).send('Product deleted from cart!');
        }
    } catch (err) {
        req.logger.error(err);
        response.status(500).send('Internal server error');
    }
}
export async function controladorUpdateCartProducts(req, res) {
    try {
        const cartId = req.params.cid;
        const products = req.body.products;
        await cartDAO.updateCartProducts(cartId, products);
        res.status(200).send('Cart products updated!');
    } catch (err) {
        req.logger.error(err);
        res.status(500).send('Error updating cart products');
    }
}
export async function controladorUpdateCartProductQty(req, res) {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity;
        await cartDAO.updateProductQuantity(cartId, productId, quantity);
        res.status(200).send('Product quantity updated!');
    } catch (err) {
        req.logger.error(err);
        res.status(500).send('Error updating product quantity');
    }
}
export async function controladorDeleteAllProducts(req, res) {
    try {
        const cartId = req.params.cid;
        await cartDAO.deleteAllProducts(cartId);
        res.status(200).send('All products deleted from cart!');
    } catch (err) {
        req.logger.error(err);
        res.status(500).send('Error deleting products from cart');
    }
}
