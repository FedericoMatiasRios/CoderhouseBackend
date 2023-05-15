import { Router } from 'express';
import { productDAO } from '../dao/mongo/models/product.model.js';
import { cartDAO } from '../dao/mongo/models/cart.model.js';
import { messageDAO } from '../dao/mongo/models/message.model.js';
import { userModel } from '../dao/mongo/models/user.model.js';

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
        console.log(payload);

        res.render('error', payload);
    }
});
webRouter.get('/realtimeproducts', async (req, res) => {
    try {
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let sort = req.query.sort ? req.query.sort : ''

        let options = {
            page: page,
            limit: limit,
            // 'asc' set by default
            sort: { price: sort === 'desc' ? -1 : 1 },
            lean: true
        };
        let products = await productDAO.getAll(options);

        const payload = {
            status: 'success',
            products: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `./?limit=${limit}&page=${products.prevPage}` : null,
            nextLink: products.hasNextPage ? `./?limit=${limit}&page=${products.nextPage}` : null,
            hayProductos: products.docs.length > 0, products
        };
        // products = JSON.parse(products);
        res.render('realTimeProducts', payload);
    } catch (err) {
        console.log(err);
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
        console.log(err);
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
        let product = await productDAO.getById(req.params.pid);
        console.log(req.params.pid)
        console.log(product)
        // Reemplazar cartId por variable que corresponda al carrito de cada usuario
        res.render('productDetail', { product, cartId: '64187748029ab3d04621d6ce' });
    } catch (err) {
        console.log(err);
    }
});
webRouter.get('/carts/:cid', async (req, res) => {
    try {
        let cart = await cartDAO.getByIdPopulate(req.params.cid);
        console.log(cart)
        res.render('cartDetail', { cart });
    } catch (err) {
        console.log(err);
    }
});
//export const productDAO = new ProductDAO('./database/products.json');
//const cartDAO = new CartDAO('./database/carts.json');