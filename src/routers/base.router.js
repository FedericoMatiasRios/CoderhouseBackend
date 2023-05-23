import express from 'express';
import cookieParser from 'cookie-parser';
import { engine } from 'express-handlebars';
import { viewRouter } from './views.router.js';
import { authRouter } from './auth.router.js';
import { productRouter } from './product.router.js';
import { cartRouter } from './cart.router.js';
import { palabraSecreta } from '../config/config.js';
import compression from 'express-compression';
import { descripciones, errors } from '../services/errors.service.js';
import { NotFoundError } from '../services/NotFoundError.service.js';
import { InvalidArgumentError } from '../services/InvalidArgumentError.service.js';

export const app = express()

app.use(compression({ brotli: { enabled: true, zlib: {} } }));
app.use(cookieParser(palabraSecreta));

app.use((error, req, res, next) => {
    if (error instanceof NotFoundError)
        res.status(404)
    else if (error instanceof InvalidArgumentError)
        res.status(400)
    else
        res.status(500)
    res.json({
        status: 'error',
        description: error.message ?? 'Error interno: causa desconocida  '
    })
});

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