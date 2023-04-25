import express from 'express';
import cookieParser from 'cookie-parser';
import { engine } from 'express-handlebars';
import { viewRouter } from './viewsRouter.js';
import { authRouter } from './authRouter.js';
import { productRouter } from './productsRouter.js';
import { cartRouter } from './cartRouter.js';

export const app = express()

const PALABRA_SECRETA = 'palabrasecreta';

app.use(cookieParser(PALABRA_SECRETA));

// configure handlebars engine
app.engine('handlebars', engine());
app.set('views', 'views');
app.set('view engine', 'handlebars');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));

app.use(authRouter);
app.use(viewRouter);
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

