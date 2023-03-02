import express from 'express'
import { ProductManager } from '../src/managers/ProductManager.js'
import { CartsManager } from '../src/managers/CartsManager.js'

import { Server } from 'socket.io'

import { Router } from 'express'
export const webRouter = Router()

webRouter.get('/', async (req, res) => {
    let products = await productManager.getProducts();
    products = JSON.parse(products)
    res.render('home', {hayProductos : products.length > 0, products});
})

webRouter.get('/realtimeproducts', async (req, res) => {
    let products = await productManager.getProducts();
    products = JSON.parse(products)
    res.render('realTimeProducts', {hayProductos : products.length > 0, products});
})

const productManager = new ProductManager('./src/database/products.json')
const cartsManager = new CartsManager('./src/database/carts.json')

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

//////////////////////////////////////
import { engine } from 'express-handlebars'
app.engine('handlebars', engine())
//views
app.set('views', './views')
app.set('view engine', 'handlebars')
app.use('/', webRouter)
app.use('/realtimeproducts', webRouter)
////////////////////////////////////7

const puerto = 8080
const servidorConectado = app.listen(puerto, ()=> { console.log('Connected.') })

const io = new Server(servidorConectado)
io.on('connection', socket => {
    console.log('New client connected!')
    
    socket.on('respuesta', data => {console.log(data)})

    //socket.emit('mensaje', 'holaaaaaaaaa')
    io.sockets.emit('mensaje', 'holaaaaaaaaa')

    socket.on('nuevoProducto', async prod => {
        await productManager.firstTime()
        await productManager.addProduct(prod)
        let products = await productManager.getProducts();
        products = JSON.parse(products)
        io.sockets.emit('actualizar', products)
    })

    socket.on('deleteProduct', async id => {
        await productManager.firstTime()
        await productManager.deleteProduct(id)
        let products = await productManager.getProducts();
        products = JSON.parse(products)
        io.sockets.emit('actualizar', products)
    })
})