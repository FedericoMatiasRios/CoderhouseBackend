import express from 'express'
import { ProductManager } from './ProductManager.js'

const productManager = new ProductManager('./products.json')

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
    response.status(201).json(request.body)
    //updateProduct(id, {title, description, price, thumbnail, code, stock})
}

async function controladorUpdate(request, response) {
    await productManager.firstTime()
    await productManager.updateProduct(request.params.pid, request.body)
    response.status(201).json(request.body)
}

async function controladorDelete(request, response) {
    await productManager.deleteProduct(request.params.pid) 
    response.status(201).send(request.body)
}

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/products', controladorProductsGet)
app.get('/products/:pid', controladorId)

app.post('/products', controladorProductsPost)

app.put('/:pid', controladorUpdate)

app.delete('/:pid', controladorDelete)

const puerto = 8080
app.listen(puerto, ()=> { console.log('Conectado.') })
