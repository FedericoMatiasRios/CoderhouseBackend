import express from 'express';
import { webRouter } from '../controllers/base.controller.js';
import { loggerTest, requireAuth } from "../controllers/utilities.controller.js";
import { handleGetMail, handlePostMail } from '../controllers/email.controller.js';
import { fakerEndPoint } from '../controllers/faker.controller.js';
import { controladorStripe } from '../services/stripe.service.js';

export const viewRouter = express.Router();

viewRouter.use('/', requireAuth, webRouter);
viewRouter.use('/realtimeproducts', webRouter);
viewRouter.use('/products', webRouter);
viewRouter.use('/products/:pid', webRouter);
viewRouter.use('/carts/:cid', webRouter);
viewRouter.post('/carts/:cid/purchase', webRouter);
viewRouter.get('/mailing', handleGetMail);
viewRouter.post('/mailing', handlePostMail);
viewRouter.use('/mockingproducts', fakerEndPoint);
viewRouter.use('/loggerTest', loggerTest);
viewRouter.post('/process-payment/:cid', controladorStripe);