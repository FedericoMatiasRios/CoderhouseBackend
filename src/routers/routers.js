import express from 'express'
import { engine } from 'express-handlebars'
import { controladorProductsGet, controladorId, controladorProductsPost, controladorGetAllCarts, controladorNewCart, controladorGetCart, controladorAddToCart, webRouter, controladorDeleteProduct, controladorUpdateProduct, controladorDeleteProductFromCart, controladorUpdateCartProducts, controladorUpdateCartProductQty, controladorDeleteAllProducts, setDefaultUserId, requireAuth } from '../controllers/controllers.js';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import session from 'express-session';

export const app = express()

const PALABRA_SECRETA = 'palabrasecreta';

app.use(cookieParser(PALABRA_SECRETA));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));

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

//session
app.use(session({
    store: MongoStore.create({
        mongoUrl: `mongodb+srv://federicomatiasrios:2407Gaee2iAhAxPQ@ecommerce.spmtua5.mongodb.net/?retryWrites=true&w=majority`
    }),
    secret: 'shhhh',
    resave: false,
    saveUninitialized: false
}))

app.get('/login', webRouter)
app.post('/login', webRouter)
app.get('/register', webRouter)
app.post('/register', webRouter)
app.get('/logout', webRouter)
// always at last of session
app.use(setDefaultUserId);

//views
app.engine('handlebars', engine())
app.set('views', 'views')
app.set('view engine', 'handlebars')
app.use('/', requireAuth, webRouter)
app.use('/realtimeproducts', webRouter)
app.use('/products', webRouter)
app.use('/products/:pid', webRouter)
app.use('/carts/:cid', webRouter)