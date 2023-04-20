import express from 'express';
import { engine } from 'express-handlebars';
import { controladorProductsGet, controladorId, controladorProductsPost, controladorGetAllCarts, controladorNewCart, controladorGetCart, controladorAddToCart, webRouter, controladorDeleteProduct, controladorUpdateProduct, controladorDeleteProductFromCart, controladorUpdateCartProducts, controladorUpdateCartProductQty, controladorDeleteAllProducts, setDefaultUserId, requireAuth, serializeUserController, deserializeUserController, githubStrategy, githubAuth, githubAuthCallback, githubAuthCallbackHandler, sessionMiddleware } from '../controllers/controllers.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import flash from 'connect-flash';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { userModel } from '../models/UserSchema.js';

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
passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, async (req, email, password, done) => {
  console.log('LocalStrategy called');

  try {
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    console.log('password: ' + password)
    console.log(user.password)
    console.log('Before bcrypt compare');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('After bcrypt compare');
    if (!isMatch) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    req.flash('success', 'Logged in successfully!');
    return done(null, user);
  } catch (err) {
    console.error(err);
    return done(err);
  }
}))
passport.serializeUser(serializeUserController);
passport.deserializeUser(deserializeUserController);

//github login
passport.use(githubStrategy);
app.get('/login/github', githubAuth());
app.get('/login/github/callback', githubAuthCallback, githubAuthCallbackHandler);

//session login
//app.get('/login', renderLoginPage);
app.get('/login', (req, res) => {
  if (req.user) {
    res.redirect('/');
  } else {
    res.render('login', { messages: req.flash(), githubAuthUrl: '/login/github' });
  }
});
//app.post('/login', loginPost);
app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => {
  if (req.user) {
    req.flash('success', 'Authentication succeeded');
    res.redirect('/');
  } else {
    req.flash('error', 'Invalid email or password');
    res.redirect('/login');
  }
});

//session register
//webRouter.get('/register', showRegisterPage);
webRouter.get('/register', (req, res) => {
  if (req.user) {
    res.redirect('/');
  } else {
    res.render('register', { messages: req.flash() });
  }
});

//webRouter.post('/register', registerUser);
webRouter.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      req.flash('error', 'Este email ya ha sido registrado');
      return res.redirect('/register');
    }

    const user = new userModel({ first_name, last_name, email, age, password });
    await user.save();

    req.flash('success', 'Registro exitoso');
    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Hubo un error al registrarse');
    res.redirect('/register');
  }
});

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