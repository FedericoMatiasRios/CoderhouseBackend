import { ProductManager } from '../dao/manafers-fs/ProductManager.js';
import { CartsManager } from '../dao/manafers-fs/CartsManager.js';
import { Router } from 'express';
import { productsManagerMongoose } from '../models/ProductSchema.js';
import { cartManagerMongoose } from '../models/CartSchema.js';
import { messagesManagerMongoose } from '../models/MessagesSchema.js';

export const webRouter = Router();
webRouter.get('/', async (req, res) => {
    try {
        let products = await productsManagerMongoose.getAll();
        // products = JSON.parse(products);
        res.render('home', { hayProductos: products.length > 0, products });
    } catch (err) {
        console.log(err);
    }
});
webRouter.get('/realtimeproducts', async (req, res) => {
    try {
        let products = await productsManagerMongoose.getAll();
        // products = JSON.parse(products);
        res.render('realTimeProducts', { hayProductos: products.length > 0, products });
    } catch (err) {
        console.log(err);
    }
});
webRouter.get('/messages', async (req, res) => {
    try {
        let messages = await messagesManagerMongoose.getAll();
        res.render('chat', { hayMensajes: messages.length > 0, messages });
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
export async function controladorUpdate(request, response) {
    try {
        // await productManager.firstTime();
        await productsManagerMongoose.updateProduct(request.params.pid, request.body);
        response.status(201).send('Product uptdated!');
    } catch (err) {
        console.log(err);
    }
}
export async function controladorDelete(request, response) {
    try {
        await productsManagerMongoose.deleteProduct(request.params.pid);
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
        let cart = await cartManagerMongoose.getById(request.params.cid);
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
