import { ProductManager } from '../dao/manafers-fs/ProductManager.js';
import { CartsManager } from '../dao/manafers-fs/CartsManager.js';
import { Router } from 'express';
import { productsManagerMongoose } from '../models/ProductSchema.js';
import { cartManagerMongoose } from '../models/CartSchema.js';
import { messagesManagerMongoose } from '../models/MessagesSchema.js';
import { userModel } from '../models/UserSchema.js';
import { Strategy as GithubStrategy } from 'passport-github2';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import passport from 'passport';

let messages = {};

export const webRouter = Router();

webRouter.get('/', async (req, res) => {
    try {
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let sort = req.query.sort ? req.query.sort : '';
        let category = req.query.category ? req.query.category : '';

        let query = {
            stock: { $gt: 0 }
        };

        if (category) {
            query = { category: category };
        }

        let options = {
            page: page,
            limit: limit,
            sort: { price: sort === 'desc' ? -1 : 1 },
            lean: true
        };

        let products = await productsManagerMongoose.getAll(query, options);

        const userId = req.user;
        let user = null;

        if (userId) {
            user = await userModel.findById(userId).lean();
        }

        const payload = {
            status: 'success',
            products: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `/?limit=${limit}&page=${products.prevPage}` : null,
            nextLink: products.hasNextPage ? `/?limit=${limit}&page=${products.nextPage}` : null,
            hayProductos: products.docs.length > 0,
            products,
            user
        };

        res.render('home', payload);
    } catch (err) {
        const payload = {
            status: 'error',
            message: err.message
        };
        console.log(payload);

        res.render('error', payload);
    }
});
webRouter.get('/realtimeproducts', async (req, res) => {
    try {
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let sort = req.query.sort ? req.query.sort : ''

        let options = {
            page: page,
            limit: limit,
            // 'asc' set by default
            sort: { price: sort === 'desc' ? -1 : 1 },
            lean: true
        };
        let products = await productsManagerMongoose.getAll(options);

        const payload = {
            status: 'success',
            products: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `./?limit=${limit}&page=${products.prevPage}` : null,
            nextLink: products.hasNextPage ? `./?limit=${limit}&page=${products.nextPage}` : null,
            hayProductos: products.docs.length > 0, products
        };
        // products = JSON.parse(products);
        res.render('realTimeProducts', payload);
    } catch (err) {
        console.log(err);
    }
});
webRouter.get('/messages', async (req, res) => {
    try {
        let options = {
            lean: true
        };
        let messages = await messagesManagerMongoose.getAll(options);
        res.render('chat', { hayMensajes: messages.docs.length > 0, messages });
    } catch (err) {
        console.log(err);
    }
});
webRouter.get('/products', async (req, res) => {
    try {
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let sort = req.query.sort ? req.query.sort : '';
        let category = req.query.category ? req.query.category : '';

        let query = {
            stock: { $gt: 0 }
        };

        if (category) {
            query = { category: category };
        }

        let options = {
            page: page,
            limit: limit,
            sort: { price: sort === 'desc' ? -1 : 1 },
            lean: true
        };

        let products = await productsManagerMongoose.getAll(query, options);

        const payload = {
            status: 'success',
            products: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `/?limit=${limit}&page=${products.prevPage}` : null,
            nextLink: products.hasNextPage ? `/?limit=${limit}&page=${products.nextPage}` : null,
            hayProductos: products.docs.length > 0, products
        };

        res.render('home', payload);
    } catch (err) {
        const payload = {
            status: 'error',
            message: err.message
        };

        res.render('error', payload);
    }
});
webRouter.get('/products/:pid', async (req, res) => {
    try {
        let product = await productsManagerMongoose.getById(req.params.pid);
        console.log(req.params.pid)
        console.log(product)
        // Reemplazar cartId por variable que corresponda al carrito de cada usuario
        res.render('productDetail', { product, cartId: '64187748029ab3d04621d6ce' });
    } catch (err) {
        console.log(err);
    }
});
webRouter.get('/carts/:cid', async (req, res) => {
    try {
        let cart = await cartManagerMongoose.getByIdPopulate(req.params.cid);
        console.log(cart)
        res.render('cartDetail', { cart });
    } catch (err) {
        console.log(err);
    }
});
export const productManager = new ProductManager('./database/products.json');
const cartsManager = new CartsManager('./database/carts.json');
// Controladores Products
export async function controladorProductsGet(request, response) {
    try {
        let products = await productsManagerMongoose.getAll();
        const limit = parseInt(request.query.limit);
        // products = JSON.parse(products);
        console.log(products);
        if (limit) {
            products = products.slice(0, limit);
        }
        response.json(products);
        // http://127.0.0.1:8080/products?limit=2
    } catch (err) {
        console.log(err);
    }
}
export async function controladorId(request, response) {
    try {
        const products = await productsManagerMongoose.getById(request.params.pid);
        response.json(products);
        // http://127.0.0.1:8080/products/2
    } catch (err) {
        console.log(err);
    }
}
export async function controladorProductsPost(request, response) {
    try {
        // await productManager.firstTime();
        await productsManagerMongoose.add(request.body);
        response.status(201).send('Product added!');
    } catch (err) {
        console.log(err);
    }
}
export async function controladorUpdateProduct(request, response) {
    try {
        // await productManager.firstTime();
        await productsManagerMongoose.updateProduct(request.params.pid, request.body);
        response.status(201).send('Product uptdated!');
    } catch (err) {
        console.log(err);
    }
}
export async function controladorDeleteProduct(request, response) {
    try {
        await productsManagerMongoose.delete(request.params.pid);
        response.status(201).send('Product deleted!');
    } catch (err) {
        console.log(err);
    }
}
// Controladores Carts
export async function controladorGetAllCarts(request, response) {
    try {
        let carts = await cartManagerMongoose.getAll();
        const limit = parseInt(request.query.limit);
        // products = JSON.parse(products);
        console.log(carts);
        if (limit) {
            carts = carts.slice(0, limit);
        }
        response.json(carts);
        // http://127.0.0.1:8080/products?limit=2
    } catch (err) {
        console.log(err);
    }
}
export async function controladorNewCart(request, response) {
    try {
        // await cartsManager.firstTime();
        await cartManagerMongoose.add({ products: [] });
        response.status(201).send('New cart created!');
    } catch (err) {
        console.log(err);
    }
}
export async function controladorGetCart(request, response) {
    try {
        let cart = await cartManagerMongoose.getByIdPopulate(request.params.cid);
        response.json(cart);
    } catch (err) {
        console.log(err);
    }
}
export async function controladorAddToCart(request, response) {
    try {
        // await cartsManager.firstTime();
        await cartManagerMongoose.addToCart(request.params.cid, { product: request.params.pid });
        response.status(201).send('Product: ' + request.params.pid + ', added in Cart: ' + request.params.cid);
    } catch (err) {
        console.log(err);
    }
}
export async function controladorDeleteProductFromCart(request, response) {
    try {
        const result = await cartManagerMongoose.deleteProductFromCart(request.params.cid, request.params.pid);
        if (result.nModified === 0) {
            response.status(404).send('Product not found in cart!');
        } else {
            response.status(201).send('Product deleted from cart!');
        }
    } catch (err) {
        console.log(err);
        response.status(500).send('Internal server error');
    }
}
export async function controladorUpdateCartProducts(req, res) {
    try {
        const cartId = req.params.cid;
        const products = req.body.products;
        await cartManagerMongoose.updateCartProducts(cartId, products);
        res.status(200).send('Cart products updated!');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error updating cart products');
    }
}
export async function controladorUpdateCartProductQty(req, res) {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity;
        await cartManagerMongoose.updateProductQuantity(cartId, productId, quantity);
        res.status(200).send('Product quantity updated!');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error updating product quantity');
    }
}
export async function controladorDeleteAllProducts(req, res) {
    try {
        const cartId = req.params.cid;
        await cartManagerMongoose.deleteAllProducts(cartId);
        res.status(200).send('All products deleted from cart!');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error deleting products from cart');
    }
}

//session
export const sessionMiddleware = session({
    store: MongoStore.create({
        mongoUrl: `mongodb+srv://federicomatiasrios:2407Gaee2iAhAxPQ@ecommerce.spmtua5.mongodb.net/?retryWrites=true&w=majority`
    }),
    secret: 'shhhh',
    resave: false,
    saveUninitialized: false
});

//login

//export function renderLoginPage(req, res) {
//    if (req.user) {
//        res.redirect('/');
//    } else {
//        res.render('login', { messages: req.flash(), githubAuthUrl: '/login/github' });
//    }
//}

//export const loginPost = passport.authenticate('local', {
//    failureRedirect: '/login',
//    failureFlash: true
//}, (req, res) => {
//    if (req.user) {
//        req.flash('success', 'Authentication succeeded');
//        res.redirect('/');
//    } else {
//        req.flash('error', 'Invalid email or password');
//        res.redirect('/login');
//    }
//});

//register

//export const showRegisterPage = (req, res) => {
//    if (req.user) {
//        res.redirect('/');
//    } else {
//        res.render('register', { messages: req.flash() });
//    }
//}

//export const registerUser = async (req, res) => {
//    try {
//        const { first_name, last_name, email, age, password } = req.body;
//        const existingUser = await userModel.findOne({ email });

//        if (existingUser) {
//            req.flash('error', 'Este email ya ha sido registrado');
//            return res.redirect('/register');
//        }

//        const user = new userModel({ first_name, last_name, email, age, password });
//        await user.save();

//        req.flash('success', 'Registro exitoso');
//        res.redirect('/');
//    } catch (error) {
//        console.error(error);
//        req.flash('error', 'Hubo un error al registrarse');
//        res.redirect('/register');
//    }
//};

webRouter.get('/logout', (req, res) => {
    req.logout(() => {
        req.session.destroy(err => {
            if (err) {
                res.render('login', { error: err })
            } else {
                res.redirect('/login')
            }
        })
    });
})

//passport
//export const localStrategy = new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, async (req, email, password, done) => {
//    console.log('LocalStrategy called');

//    try {
//        const user = await userModel.findOne({ email: email });
//        if (!user) {
//            return done(null, false, { message: 'Invalid email or password' });
//        }
//        console.log('password: ' + password)
//        console.log(user.password)
//        console.log('Before bcrypt compare');
//        const isMatch = await bcrypt.compare(password, user.password);
//        console.log('After bcrypt compare');
//        if (!isMatch) {
//            return done(null, false, { message: 'Invalid email or password' });
//        }
//        req.flash('success', 'Logged in successfully!');
//        return done(null, user);
//    } catch (err) {
//        console.error(err);
//        return done(err);
//    }
//})

export const serializeUserController = (user, done) => {
    done(null, user._id);
};

export const deserializeUserController = async (id, done) => {
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
};

//passport github login
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

export const githubStrategy = new GithubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/login/github/callback"
},
    async function (accessToken, refreshToken, githubUser, done) {
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
)

export const githubAuth = () => passport.authenticate('github', { scope: ['user:email'] });

export const githubAuthCallback = passport.authenticate('github', { failureRedirect: '/login' });

export const githubAuthCallbackHandler = (req, res) => {
    res.redirect('/');
};

//utilities
export const setDefaultUserId = (req, res, next) => {
    if (!req.session) {
        req.session = {};
    }

    if (!req.session.userId) {
        req.session.userId = null;
    }

    next();
};

export const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated() && req.path !== '/login' && req.path !== '/register') {
        return res.redirect('/login');
    }
    return next();
};