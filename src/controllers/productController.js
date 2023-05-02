import { productsManagerMongoose } from '../models/ProductSchema.js';

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
