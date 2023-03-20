import express from 'express'
import { engine } from 'express-handlebars'
import { ProductManager } from './managers/ProductManager.js';
import { CartsManager } from './managers/CartsManager.js';
import { Router } from 'express';
import { productsManagerMongoose } from './managers/ProductManagerMongoose.js';
import { cartManagerMongoose } from './managers/CartsManagerMongoose.js';

export const webRouter = Router();
webRouter.get('/', async (req, res) => {
    try {
    let products = await productsManagerMongoose.getProducts();
    // products = JSON.parse(products);
    res.render('home', { hayProductos: products.length > 0, products });
    } catch(err) { 
        console.log(err)
    }
});
webRouter.get('/realtimeproducts', async (req, res) => {
    try {
    let products = await productsManagerMongoose.getProducts();
    // products = JSON.parse(products);
    res.render('realTimeProducts', { hayProductos: products.length > 0, products });
    } catch(err) { 
        console.log(err)
    }
});
export const productManager = new ProductManager('./database/products.json');
const cartsManager = new CartsManager('./database/carts.json');
// Controladores Products
async function controladorProductsGet(request, response) {
    try {
    let products = await productsManagerMongoose.getProducts();
    const limit = parseInt(request.query.limit);
    // products = JSON.parse(products);
    console.log(products);
    if (limit) {
        products = products.slice(0, limit);
    }
    response.json(products);
    // http://127.0.0.1:8080/products?limit=2
    } catch(err) { 
        console.log(err)
    }
}
async function controladorId(request, response) {
    try {
    const products = await productsManagerMongoose.getProductById(request.params.pid);
    response.json(products);
    // http://127.0.0.1:8080/products/2
    } catch(err) { 
        console.log(err)
    }
}
async function controladorProductsPost(request, response) {
    try {
    // await productManager.firstTime();
    await productsManagerMongoose.addProduct(request.body);
    response.status(201).send('Product added!');
    } catch(err) { 
        console.log(err)
    }
}
async function controladorUpdate(request, response) {
    try {
    // await productManager.firstTime();
    await productsManagerMongoose.updateProduct(request.params.pid, request.body);
    response.status(201).send('Product uptdated!');
    } catch(err) { 
        console.log(err)
    }
}
async function controladorDelete(request, response) {
    try {
    await productsManagerMongoose.deleteProduct(request.params.pid);
    response.status(201).send('Product deleted!');
    } catch(err) { 
        console.log(err)
    }
}
// Controladores Carts
async function controladorNewCart(request, response) {
    try {
    // await cartsManager.firstTime();
    await cartManagerMongoose.newCart({ products: [] });
    response.status(201).send('New cart created!');
    } catch(err) { 
        console.log(err)
    }
}
async function controladorGetCart(request, response) {
    try {
    let cart = await cartManagerMongoose.getCartById(request.params.cid);
    response.json(cart);
    } catch(err) { 
        console.log(err)
    }
}
async function controladorAddToCart(request, response) {
    try {
    // await cartsManager.firstTime();
    await cartManagerMongoose.addToCart(request.params.cid, { product: request.params.pid });
    response.status(201).send('Product: ' + request.params.pid + ', added in Cart: ' + request.params.cid);
    } catch(err) { 
        console.log(err)
    }
}

export const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

//products
app.get('/api/products', controladorProductsGet)
app.get('/api/products/:pid', controladorId)
app.post('/api/products', controladorProductsPost)
app.put('/api/products/:pid', controladorUpdate)
app.delete('/api/products/:pid', controladorDelete)

//cart
app.post('/api/carts/', controladorNewCart)
app.get('/api/carts/:cid', controladorGetCart)
app.post('/api/carts/:cid/product/:pid', controladorAddToCart)

//views
app.engine('handlebars', engine())
app.set('views', '../views')
app.set('view engine', 'handlebars')
app.use('/', webRouter)
app.use('/realtimeproducts', webRouter)