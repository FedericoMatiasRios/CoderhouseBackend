import { ProductManager } from '../dao/manafers-fs/ProductManager.js';
import { CartsManager } from '../dao/manafers-fs/CartsManager.js';
import { Router } from 'express';
import { productsManagerMongoose } from '../models/ProductSchema.js';
import { cartManagerMongoose } from '../models/CartSchema.js';
import { messagesManagerMongoose } from '../models/MessagesSchema.js';

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

        let products = await productsManagerMongoose.getAll(query, options);

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
        let products = await productsManagerMongoose.getAll(options);

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
        let messages = await messagesManagerMongoose.getAll(options);
        res.render('chat', { hayMensajes: messages.docs.length > 0, messages });
    } catch (err) {
        console.log(err);
    }
});
webRouter.get('/products', async (req, res) => {
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

        let products = await productsManagerMongoose.getAll(options);

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
        let product = await productsManagerMongoose.getById(req.params.pid);
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
        let cart = await cartManagerMongoose.getByIdPopulate(req.params.cid);
        console.log(cart)
        res.render('cartDetail', { cart });
    } catch (err) {
        console.log(err);
    }
});
export const productManager = new ProductManager('./database/products.json');
const cartsManager = new CartsManager('./database/carts.json');
// Controladores Products
export async function controladorProductsGet(request, response) {
    try {
        let products = await productsManagerMongoose.getAll();
        const limit = parseInt(request.query.limit);
        // products = JSON.parse(products);
        console.log(products);
        if (limit) {
            products = products.slice(0, limit);
        }
        response.json(products);
        // http://127.0.0.1:8080/products?limit=2
    } catch (err) {
        console.log(err);
    }
}
export async function controladorId(request, response) {
    try {
        const products = await productsManagerMongoose.getById(request.params.pid);
        response.json(products);
        // http://127.0.0.1:8080/products/2
    } catch (err) {
        console.log(err);
    }
}
export async function controladorProductsPost(request, response) {
    try {
        // await productManager.firstTime();
        await productsManagerMongoose.add(request.body);
        response.status(201).send('Product added!');
    } catch (err) {
        console.log(err);
    }
}
export async function controladorUpdateProduct(request, response) {
    try {
        // await productManager.firstTime();
        await productsManagerMongoose.updateProduct(request.params.pid, request.body);
        response.status(201).send('Product uptdated!');
    } catch (err) {
        console.log(err);
    }
}
export async function controladorDeleteProduct(request, response) {
    try {
        await productsManagerMongoose.delete(request.params.pid);
        response.status(201).send('Product deleted!');
    } catch (err) {
        console.log(err);
    }
}
// Controladores Carts
export async function controladorGetAllCarts(request, response) {
    try {
        let carts = await cartManagerMongoose.getAll();
        const limit = parseInt(request.query.limit);
        // products = JSON.parse(products);
        console.log(carts);
        if (limit) {
            carts = carts.slice(0, limit);
        }
        response.json(carts);
        // http://127.0.0.1:8080/products?limit=2
    } catch (err) {
        console.log(err);
    }
}
export async function controladorNewCart(request, response) {
    try {
        // await cartsManager.firstTime();
        await cartManagerMongoose.add({ products: [] });
        response.status(201).send('New cart created!');
    } catch (err) {
        console.log(err);
    }
}
export async function controladorGetCart(request, response) {
    try {
        let cart = await cartManagerMongoose.getByIdPopulate(request.params.cid);
        response.json(cart);
    } catch (err) {
        console.log(err);
    }
}
export async function controladorAddToCart(request, response) {
    try {
        // await cartsManager.firstTime();
        await cartManagerMongoose.addToCart(request.params.cid, { product: request.params.pid });
        response.status(201).send('Product: ' + request.params.pid + ', added in Cart: ' + request.params.cid);
    } catch (err) {
        console.log(err);
    }
}
export async function controladorDeleteProductFromCart(request, response) {
    try {
        const result = await cartManagerMongoose.deleteProductFromCart(request.params.cid, request.params.pid);
        if (result.nModified === 0) {
            response.status(404).send('Product not found in cart!');
        } else {
            response.status(201).send('Product deleted from cart!');
        }
    } catch (err) {
        console.log(err);
        response.status(500).send('Internal server error');
    }
}
export async function controladorUpdateCartProducts(req, res) {
    try {
        const cartId = req.params.cid;
        const products = req.body.products;
        await cartManagerMongoose.updateCartProducts(cartId, products);
        res.status(200).send('Cart products updated!');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error updating cart products');
    }
}
export async function controladorUpdateCartProductQty(req, res) {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity;
        await cartManagerMongoose.updateProductQuantity(cartId, productId, quantity);
        res.status(200).send('Product quantity updated!');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error updating product quantity');
    }
}
export async function controladorDeleteAllProducts(req, res) {
    try {
        const cartId = req.params.cid;
        await cartManagerMongoose.deleteAllProducts(cartId);
        res.status(200).send('All products deleted from cart!');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error deleting products from cart');
    }
}