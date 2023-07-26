import stripe from 'stripe';
import { app } from '../routers/base.router.js';
import { stripeSecret } from '../config/config.js';
import { cartDAO } from '../dao/mongo/models/cart.model.js';

const stripeInstance = stripe(stripeSecret);

app.post('/process-payment', async (req, res) => {
  console.log('entering in payment');
  try {
    const { token } = req.body;
    const paymentDetails = {
      amount: 1000, // Amount in cents
      currency: 'usd',
      source: token,
      description: 'Test Payment',
    };

    console.log('before charge await');

    const charge = await stripeInstance.charges.create(paymentDetails);
    console.log('Payment successful:', charge.id);

    const cart = await cartDAO.getById(req.params.cid);

    res.status(200).json({ success: true, cartId: cart.id });
  } catch (err) {
    console.error('Payment failed:', err.message);
    res.status(500).json({ status: 'error', message: 'Payment failed' });
  }
});