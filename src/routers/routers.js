import express from 'express'
import { engine } from 'express-handlebars'
import { controladorProductsGet, controladorId, controladorProductsPost, controladorGetAllCarts, controladorNewCart, controladorGetCart, controladorAddToCart, webRouter, controladorDeleteProduct, controladorUpdateProduct, controladorDeleteProductFromCart, controladorUpdateCartProducts, controladorUpdateCartProductQty, controladorDeleteAllProducts, setDefaultUserId, requireAuth } from '../controllers/controllers.js';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import passport from 'passport';

import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { userModel } from '../models/UserSchema.js';

import flash from 'connect-flash';

import { Strategy as GithubStrategy } from 'passport-github2';


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

app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

// define Passport strategies

passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, async (req, email, password, done) => {
    console.log('LocalStrategy called');
  
    try {
      const user = await userModel.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      req.flash('success', 'Logged in successfully!');
      return done(null, user);
    } catch (err) {
      console.error(err);
      return done(err);
    }
  }));


passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    console.log('deserializeUser called with id:', id);
    try {
      const user = await userModel.findById(id);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      console.error(err);
      return done(err);
    }
  });


//Github login
  function mapGithubUserToLocalUser(githubUser) {
    console.log(githubUser)
    const email = githubUser._json.email != null ? githubUser._json.email : `${githubUser.username}@github.com`;
    const firstName = githubUser.displayName != null ? githubUser.displayName : 'Unknown';
    const lastName = githubUser.id != null ? githubUser.id : 'Unknown';
    const age = 0;
    const password = 'generateRandomLater';
  
    return {
      email,
      first_name: firstName,
      last_name: lastName,
      age,
      password,
    };
  }

const GITHUB_CLIENT_ID = 'Iv1.84402c963ad0e301';
const GITHUB_CLIENT_SECRET = 'b6b7cf64ccfc65a9fbfd885a39fc777ac27f4e24';

passport.use(new GithubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/login/github/callback"
  },
  async function(accessToken, refreshToken, githubUser, done) {
    // asynchronous verification, for effect...
    process.nextTick(async function () {
  
      // Map the Github user to your local user schema
      const user = mapGithubUserToLocalUser(githubUser);
  
      try {
        // Check if the user already exists in the database
        const email = githubUser._json.email != null ? githubUser._json.email : `${githubUser.username}@github.com`;
        const existingUser = await userModel.findOne({ email: email });
  
        if (existingUser) {
            console.log('user already exists, updated')
          // Update the existing user with the latest Github info
          const updatedUser = await userModel.findOneAndUpdate(
            { email: email },
            user,
            { new: true }
          );
          return done(null, updatedUser);
        } else {
            console.log('New github user created')
          // Save the user to the database and return it
          const createdUser = await userModel.create(user);
          return done(null, createdUser);
        }
      } catch (err) {
        return done(err);
      }
    });
  }
  ));

  
  // Define your routes
  app.get('/login/github', passport.authenticate('github', { scope: [ 'user:email' ] }));
  
  app.get('/login/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });
  

  //github end

  let messages = {};

// define your routes
app.get('/login', (req, res) => {
    if (req.user) {
      res.redirect('/');
    } else {
      res.render('login', { messages: req.flash(), githubAuthUrl: '/login/github' });
    }
  });
  
  app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), (req, res) => {
      if (req.user) {
        req.flash('success', 'Authentication succeeded');
        res.redirect('/');
      } else {
        req.flash('error', 'Invalid email or password');
        res.redirect('/login');
      }
  });


  webRouter.get('/register', (req, res) => {
    if (req.user) {
        res.redirect('/');
    } else {
        res.render('register', { messages: req.flash() });
    }
});

webRouter.post('/register', async (req, res) => {
    try {
      const { first_name, last_name, email, age, password } = req.body;
      const existingUser = await userModel.findOne({ email });
  
      if (existingUser) {
        req.flash('error', 'Este email ya ha sido registrado');
        return res.redirect('/register');
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new userModel({ first_name, last_name, email, age, password: hashedPassword });
      await user.save();
      
      req.flash('success', 'Registro exitoso');
      res.redirect('/');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Hubo un error al registrarse');
      res.redirect('/register');
    }
  });

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