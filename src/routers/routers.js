import express from 'express';
import { engine } from 'express-handlebars';
import { controladorProductsGet, controladorId, controladorProductsPost, controladorGetAllCarts, controladorNewCart, controladorGetCart, controladorAddToCart, webRouter, controladorDeleteProduct, controladorUpdateProduct, controladorDeleteProductFromCart, controladorUpdateCartProducts, controladorUpdateCartProductQty, controladorDeleteAllProducts, setDefaultUserId, requireAuth, serializeUserController, deserializeUserController, githubStrategy, githubAuth, githubAuthCallback, githubAuthCallbackHandler, sessionMiddleware, renderLoginPage, handleLogin, showRegisterPage, registerUser, localStrategy } from '../controllers/controllers.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import flash from 'connect-flash';

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
app.use(sessionMiddleware);

app.use(flash());

//passport
app.use(passport.initialize());
app.use(passport.session());

//passport.use(localStrategy);
passport.use(localStrategy)
passport.serializeUser(serializeUserController);
passport.deserializeUser(deserializeUserController);

//github login
passport.use(githubStrategy);
app.get('/login/github', githubAuth());
app.get('/login/github/callback', githubAuthCallback, githubAuthCallbackHandler);

//session login
app.get('/login', renderLoginPage);
app.post('/login', handleLogin);

//session register
webRouter.get('/register', showRegisterPage);
webRouter.post('/register', registerUser);

//session logout
app.get('/logout', webRouter)

//define this always after session
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