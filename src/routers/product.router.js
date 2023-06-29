import express from 'express';
import { controladorProductsGet, controladorId, controladorProductsPost, controladorDeleteProduct, controladorUpdateProduct } from "../controllers/product.controller.js";
import { requireAuth } from '../controllers/utilities.controller.js';
import { productDAO } from '../dao/mongo/models/product.model.js';
import { userModel } from '../dao/mongo/models/user.model.js';

export const productRouter = express.Router();

// El usuario tiene role 'admin'?
const isAdmin = async (req, res, next) => {
  if (!req.user) {
    var credentials = req.headers.authorization.split(' ')[1];
    var decodedCredentials = Buffer.from(credentials, 'base64').toString();
    var [email, password] = decodedCredentials.split(':');
  
    const user = await userModel.findOne({ email: email });

    req.user = user;
  }

  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

// El usuario tiene role 'premium'? o 'admin'?
const isAdminOrPremium = async (req, res, next) => {
  if (!req.user) {
    var credentials = req.headers.authorization.split(' ')[1];
    var decodedCredentials = Buffer.from(credentials, 'base64').toString();
    var [email, password] = decodedCredentials.split(':');
  
    // Assuming you have retrieved the user object based on the authenticated email
    const user = await userModel.findOne({ email: email });

    // Populate req.user with the authenticated user object
    req.user = user;
  }
  if (req.user && req.user.role === 'admin') {
    next();
  } else if (req.user && req.user.role === 'premium') {
    next();
    /* if (req.params.pid) {
      const product = await productDAO.findOne({ _id: req.params.pid, owner: req.user.email });
      if (!product) {
        res.status(401).send('Unauthorized');
        return;
      }
      next();
    } else {
      res.status(401).send('Unauthorized');
    } */
  } else {
    res.status(401).send('Unauthorized');
  }
};

// Solo puede utilizarlas el 'admin'
productRouter.post('/', controladorProductsPost);
productRouter.put('/:pid', requireAuth, isAdmin, controladorUpdateProduct);
productRouter.delete('/:pid', requireAuth, isAdminOrPremium, controladorDeleteProduct);

// Puede verlas cualquier usuario
productRouter.get('/', controladorProductsGet);
productRouter.get('/:pid', controladorId);
