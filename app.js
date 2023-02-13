import express from 'express'
import { ProductManager } from './ProductManager.js'

const productManager = new ProductManager('./products.json')

async function controladorProducts(request, response) {

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

const app = express()

app.get('/products', controladorProducts)
app.get('/products/:pid', controladorId)

const puerto = 8080
app.listen(puerto, ()=> { console.log('Conectado.') })
