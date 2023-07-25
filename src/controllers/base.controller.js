import { Router } from 'express';
import { productDAO } from '../dao/mongo/models/product.model.js';
import { cartDAO } from '../dao/mongo/models/cart.model.js';
import { messageDAO } from '../dao/mongo/models/message.model.js';
import { userDAO, userModel } from '../dao/mongo/models/user.model.js';
import { ticketDAO } from '../dao/mongo/models/ticket.model.js';
import crypto from 'crypto';

let messages = {};

export const webRouter = Router();

webRouter.get('/', async (req, res) => {
    try {
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let sort = req.query.sort ? req.query.sort : '';
        let category = req.query.category ? req.query.category : '';

        let query = {
            stock: { $gt: 0 }
        };

        if (category) {
            query = { category: category };
        }

        let options = {
            page: page,
            limit: limit,
            sort: { price: sort === 'desc' ? -1 : 1 },
            lean: true
        };

        let products = await productDAO.getAll(query, options);

        const userId = req.user;
        let user = null;

        if (userId) {
            user = await userModel.findById(userId).lean();
        }

        const payload = {
            status: 'success',
            products: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `/?limit=${limit}&page=${products.prevPage}` : null,
            nextLink: products.hasNextPage ? `/?limit=${limit}&page=${products.nextPage}` : null,
            hayProductos: products.docs.length > 0,
            products,
            user
        };

        res.render('home', payload);
    } catch (err) {
        const payload = {
            status: 'error',
            message: err.message
        };
        req.logger.debug(payload);

        res.render('error', payload);
    }
});
webRouter.get('/realtimeproducts', async (req, res) => {
    try {
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let sort = req.query.sort ? req.query.sort : '';
        let category = req.query.category ? req.query.category : '';

        let query = {
            stock: { $gt: 0 }
        };

        if (category) {
            query = { category: category };
        }

        let options = {
            page: page,
            limit: limit,
            sort: { price: sort === 'desc' ? -1 : 1 },
            lean: true
        };

        let products = await productDAO.getAll(query, options);

        const userId = req.user;
        let user = null;

        if (userId) {
            user = await userModel.findById(userId).lean();
        }

        const payload = {
            status: 'success',
            products: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `/realtimeproducts/?limit=${limit}&page=${products.prevPage}` : null,
            nextLink: products.hasNextPage ? `/realtimeproducts/?limit=${limit}&page=${products.nextPage}` : null,
            hayProductos: products.docs.length > 0, 
            products,
            user
        };
        res.render('realTimeProducts', payload);
    } catch (err) {
        req.logger.debug(err);
    }
});
webRouter.get('/messages', async (req, res) => {
    try {
        let options = {
            lean: true
        };
        messages = await messageDAO.getAll(options);
        res.render('chat', { hayMensajes: messages.docs.length > 0, messages });
    } catch (err) {
        req.logger.debug(err);
    }
});
webRouter.get('/products', async (req, res) => {
    try {
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let sort = req.query.sort ? req.query.sort : '';
        let category = req.query.category ? req.query.category : '';

        let query = {
            stock: { $gt: 0 }
        };

        if (category) {
            query = { category: category };
        }

        let options = {
            page: page,
            limit: limit,
            sort: { price: sort === 'desc' ? -1 : 1 },
            lean: true
        };

        let products = await productDAO.getAll(query, options);

        const payload = {
            status: 'success',
            products: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `/?limit=${limit}&page=${products.prevPage}` : null,
            nextLink: products.hasNextPage ? `/?limit=${limit}&page=${products.nextPage}` : null,
            hayProductos: products.docs.length > 0, products
        };

        res.render('home', payload);
    } catch (err) {
        const payload = {
            status: 'error',
            message: err.message
        };

        res.render('error', payload);
    }
});
webRouter.get('/products/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productDAO.getById(productId);
        const userId = req.user;
        const user = await userDAO.getById(userId);

        if (user) {
            // Check if the user already has a cart, get it or create a new cart
            let cart = user.cart;
            if (!cart) {
                // User does not have a cart, create a new one
                const newCart = await cartDAO.add();
                cart = newCart._id;

                // Update the user's cart field with the new cart's _id
                await userDAO.updateUserCart(userId, cart);
            }

            // Use the cart ID in the response
            res.render('productDetail', { product, cartId: cart });
        } else {
            res.render('productDetail', { product });
        }
    } catch (err) {
        req.logger.error(err);
        res.status(500).send('Internal Server Error');
    }
});
webRouter.get('/carts/:cid', async (req, res) => {
    try {
        let cart = await cartDAO.getByIdPopulate(req.params.cid);
        req.logger.debug(cart)
        res.render('cartDetail', { cart });
    } catch (err) {
        req.logger.debug(err);
    }
});

webRouter.post('/carts/:cid/purchase', async (req, res) => {

    const cid = req.params.cid;

    try {
        const cart = await cartDAO.getById(cid);

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Check if user is authenticated
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verificar si el stock está disponible
        const productsInCart = cart.products;
        const insufficientStockProducts = [];

        for (let i = 0; i < productsInCart.length; i++) {
            const product = await productDAO.getById(productsInCart[i].product);
            if (!product || product.stock < productsInCart[i].quantity) {
                insufficientStockProducts.push(product.title);
            }
        }

        if (insufficientStockProducts.length > 0) {
            return res.status(400).json({ message: `Insufficient stock for the following products: ${insufficientStockProducts.join(', ')}` });
        }

        // Calcular el monto total
        let amount = 0;

        for (const product of productsInCart) {
            const dbProduct = await productDAO.getById(product.product);
            if (!dbProduct) {
                return res.status(404).json({ message: `Product with id ${product.product} not found` });
            }
            amount += dbProduct.price * product.quantity;

            // Reducir el stock disponible según el quantity de cada producto agregado al carrito
            const newStock = dbProduct.stock - product.quantity;
            await productDAO.updateProduct(product.product, { stock: newStock });
        }

        const ticket = {
            code: crypto.randomBytes(20).toString('hex'),
            amount: amount,
            purchaser: req.user.email
        };

        req.logger.debug(ticket);

        await ticketDAO.create(ticket);

        return res.status(200).json({ message: `Thank you ${ticket.purchaser}, your order has been placed. Code: ${ticket.code}, Amount: $${ticket.amount}` });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});
//export const productDAO = new ProductDAO('./database/products.json');
//const cartDAO = new CartDAO('./database/carts.json');