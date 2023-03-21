import express from 'express'
import { engine } from 'express-handlebars'
import { controladorProductsGet, controladorId, controladorProductsPost, controladorUpdate, controladorDelete, controladorGetAllCarts, controladorNewCart, controladorGetCart, controladorAddToCart, webRouter } from '../controllers/controllers.js';

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
app.get('/api/carts/', controladorGetAllCarts)
app.post('/api/carts/', controladorNewCart)
app.get('/api/carts/:cid', controladorGetCart)
app.post('/api/carts/:cid/product/:pid', controladorAddToCart)

//views
app.engine('handlebars', engine())
app.set('views', 'views')
app.set('view engine', 'handlebars')
app.use('/', webRouter)
app.use('/realtimeproducts', webRouter)