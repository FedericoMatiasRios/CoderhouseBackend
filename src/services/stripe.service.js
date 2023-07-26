import stripe from 'stripe';
import { stripeSecret } from '../config/config.js';
import { cartDAO } from '../dao/mongo/models/cart.model.js';
import { ticketDAO } from '../dao/mongo/models/ticket.model.js';
import { productDAO } from '../dao/mongo/models/product.model.js';
import crypto from 'crypto';

const stripeInstance = stripe(stripeSecret);

export async function controladorStripe(req, res) {
  try {
    
    // --- Ticket ---
    const cid = req.params.cid;
    const cart = await cartDAO.getById(cid);

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verificar si el stock está disponible
    const productsInCart = cart.products;
    const insufficientStockProducts = [];

    for (let i = 0; i < productsInCart.length; i++) {
      const product = await productDAO.getById(productsInCart[i].product);
      if (!product || product.stock < productsInCart[i].quantity) {
        insufficientStockProducts.push(product.title);
      }
    }

    if (insufficientStockProducts.length > 0) {
      return res.status(400).json({ message: `Insufficient stock for the following products: ${insufficientStockProducts.join(', ')}` });
    }

    // Calcular el monto total
    let amount = 0;

    for (const product of productsInCart) {
      const dbProduct = await productDAO.getById(product.product);
      if (!dbProduct) {
        return res.status(404).json({ message: `Product with id ${product.product} not found` });
      }
      amount += dbProduct.price * product.quantity;

      // Reducir el stock disponible según el quantity de cada producto agregado al carrito
      const newStock = dbProduct.stock - product.quantity;
      await productDAO.updateProduct(product.product, { stock: newStock });
    }

    const ticket = {
      code: crypto.randomBytes(20).toString('hex'),
      amount: amount,
      purchaser: req.user.email
    };

    req.logger.debug(ticket);

    await ticketDAO.create(ticket);

    // --- Stripe ---
    const { token } = req.body;

    const paymentDetails = {
      amount: amount, // Cents, 2870 equals to $28.70 usd
      currency: 'usd',
      source: token, // Token received from frontend
      description: 'Test Payment',
    };

    const charge = await stripeInstance.charges.create(paymentDetails);
    console.log('Payment successful:', charge.id);

    // --- Response ---
    return res.status(200).json({ success: true, message: `Thank you ${ticket.purchaser}, your order has been placed. Code: ${ticket.code}, Amount: $${ticket.amount}` });

  } catch (err) {
    console.error('Payment failed:', err.message);
    res.status(500).json({ status: 'error', message: 'Payment failed' });
  }
};

