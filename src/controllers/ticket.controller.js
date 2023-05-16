import { cartDAO } from '../dao/mongo/models/cart.model.js'
import { productDAO } from '../dao/mongo/models/product.model.js';
import { ticketDAO } from '../dao/mongo/models/ticket.model.js';
import crypto from 'crypto';

/* export async function createNewTicket(req, res) {
    const cid = req.params.cid;

    try {

        const cart = await cartDAO.getById(cid);

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        let ticket;

        if (req.headers.authorization && req.headers.authorization.startsWith('Basic ')) {
            const base64Credentials = req.headers.authorization.split(' ')[1];
            const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
            const [email, password] = credentials.split(':');

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
            }

            ticket = {
                code: crypto.randomBytes(20).toString('hex'),
                amount: amount,
                purchaser: email
            };

            console.log(ticket);

            await ticketDAO.create(ticket);

            return res.status(200).json({ message: 'Your order has been placed' });
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
} */