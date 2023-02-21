import express from 'express'
import { ProductManager } from '../src/managers/ProductManager.js'
import { CartsManager } from '../src/managers/CartsManager.js'

const productManager = new ProductManager('./database/products.json')
const cartsManager = new CartsManager('./database/carts.json')

// Controladores Products

async function controladorProductsGet(request, response) {

    let products = await productManager.getProducts()
    const limit = parseInt(request.query.limit)
    products = JSON.parse(products)

    if (limit) {
        products = products.slice(0, limit)
    }
    response.json(products)
    // http://127.0.0.1:8080/products?limit=2
}

async function controladorId(request, response) {
    const products = await productManager.getProductById(request.params.pid)
    response.json(products)
    // http://127.0.0.1:8080/products/2
}

async function controladorProductsPost(request, response) {
    await productManager.firstTime()
    await productManager.addProduct(request.body)
    response.status(201).send('Product added!')
}

async function controladorUpdate(request, response) {
    await productManager.firstTime()
    await productManager.updateProduct(request.params.pid, request.body)
    response.status(201).send('Product uptdated!')
}

async function controladorDelete(request, response) {
    await productManager.deleteProduct(request.params.pid) 
    response.status(201).send('Product deleted!')
}

// Controladores Carts

async function controladorNewCart(request, response) {
    await cartsManager.firstTime()
    await cartsManager.newCart({products: []})
    response.status(201).send('New cart created!')
}

async function controladorGetCart(request, response) {
    let cart = await cartsManager.getCartById(request.params.cid)
    response.json(cart)
}

async function controladorAddToCart(request, response) {
    await cartsManager.firstTime()
    await cartsManager.addToCart(request.params.cid, {product: request.params.pid})
    response.status(201).send('Product: ' + request.params.pid + ', added in Cart: ' + request.params.cid)
}

const app = express()

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


const puerto = 8080
app.listen(puerto, ()=> { console.log('Conectado.') })
