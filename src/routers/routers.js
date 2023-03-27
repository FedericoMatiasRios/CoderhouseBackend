import express from 'express'
import { engine } from 'express-handlebars'
import { controladorProductsGet, controladorId, controladorProductsPost, controladorGetAllCarts, controladorNewCart, controladorGetCart, controladorAddToCart, webRouter, controladorDeleteProduct, controladorUpdateProduct, controladorDeleteProductFromCart, controladorUpdateCartProducts, controladorUpdateCartProductQty, controladorDeleteAllProducts } from '../controllers/controllers.js';

export const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

//products
app.get('/api/products', controladorProductsGet)
app.get('/api/products/:pid', controladorId)
app.post('/api/products', controladorProductsPost)
app.put('/api/products/:pid', controladorUpdateProduct)
app.delete('/api/products/:pid', controladorDeleteProduct)

//cart
app.get('/api/carts/', controladorGetAllCarts)
app.post('/api/carts/', controladorNewCart)
app.get('/api/carts/:cid', controladorGetCart)
app.post('/api/carts/:cid/product/:pid', controladorAddToCart)
app.delete('/api/carts/:cid/products/:pid', controladorDeleteProductFromCart)
app.put('/api/carts/:cid', controladorUpdateCartProducts)
app.put('/api/carts/:cid/products/:pid', controladorUpdateCartProductQty)
app.delete('/api/carts/:cid', controladorDeleteAllProducts)

//views
app.engine('handlebars', engine())
app.set('views', 'views')
app.set('view engine', 'handlebars')
app.use('/', webRouter)
app.use('/realtimeproducts', webRouter)
app.use('/products', webRouter)
app.use('/products/:pid', webRouter)
app.use('/carts/:cid', webRouter)