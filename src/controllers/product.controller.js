import { productDAO } from '../dao/mongo/models/product.model.js';
import { userModel } from '../dao/mongo/models/user.model.js';

// Controladores Products
export async function controladorProductsGet(request, response) {
    try {
        let products = await productDAO.getAll();
        const limit = parseInt(request.query.limit);
        // products = JSON.parse(products);
        request.logger.info(products);
        if (limit) {
            products = products.slice(0, limit);
        }
        response.json(products);
        // http://127.0.0.1:8080/products?limit=2
    } catch (err) {
        request.logger.error(err);
    }
}
export async function controladorId(request, response) {
    try {
        const products = await productDAO.getById(request.params.pid);
        response.json(products);
        // http://127.0.0.1:8080/products/2
    } catch (err) {
        request.logger.error(err);
    }
}
export async function controladorProductsPost(request, response) {
    try {
        const { title, description, code, price, stock, category, thumbnails } = request.body;

        let owner;

        if (!request.user) {

            var credentials = request.headers.authorization.split(' ')[1];

            var decodedCredentials = Buffer.from(credentials, 'base64').toString();
            var [email, password] = decodedCredentials.split(':');

            // Assuming you have retrieved the user object based on the authenticated email
            const userFromBasicAuth = await userModel.findOne({ email: email });
            if (userFromBasicAuth) {
                request.user = userFromBasicAuth;
            }
        }

        if (request.user.role === 'admin') {
            owner = 'admin';
        } else if (request.user.role === 'premium') {
            owner = request.user.email;
        } else {
            response.status(401).send('Only users with premium or admin role can be assigned as product owners');
        }

        // Create the product object
        const product = {
            title,
            description,
            code,
            price,
            stock,
            category,
            thumbnails,
            owner,
        };

        const createdProduct = await productDAO.add(product);
        response.status(201).json(createdProduct);

    } catch (err) {
        request.logger.error(err);
        // Handle the error accordingly
    }
}
export async function controladorUpdateProduct(request, response) {
    try {
        // await productDAO.firstTime();
        await productDAO.updateProduct(request.params.pid, request.body);
        response.status(201).send('Product uptdated!');
    } catch (err) {
        request.logger.error(err);
    }
}
export async function controladorDeleteProduct(request, response) {
    try {
        await productDAO.delete(request.params.pid);
        response.status(201).send('Product deleted!');
    } catch (err) {
        request.logger.error(err);
    }
}
