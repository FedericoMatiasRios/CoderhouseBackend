import { Server } from 'socket.io'
import { productDAO } from './dao/mongo/models/product.model.js'
import { app } from './routers/base.router.js'
import { mongoose } from 'mongoose'
import { messageDAO } from './dao/mongo/models/message.model.js'
import { mongodbCnxStr } from './config/config.js'
import { winstonLogger } from './utils/winstonLogger.js'
import { userDAO } from './dao/mongo/models/user.model.js'
import { controladorSwitchRole } from './controllers/user.controller.js'
import { sendPasswordRecoveryEmail } from './controllers/pw-recovery.controller.js'

await mongoose.connect(mongodbCnxStr, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'ecommerce',
})
  .then(() => {
    winstonLogger.info('Connected to Mongo Database.');
  })
  .catch(err => winstonLogger.error(err));

const puerto = 8080
const servidorConectado = app.listen(puerto, () => { winstonLogger.info('Connected.') })

const io = new Server(servidorConectado)
io.on('connection', socket => {
  winstonLogger.info('New client connected!')

  socket.on('nuevoProducto', async prod => {
    // await productDAO.firstTime()
    // await productDAO.addProduct(prod)
    // let products = await productDAO.getProducts();

    await productDAO.add(prod)
    let products = await productDAO.getAll();

    // products = JSON.parse(products)
    io.sockets.emit('actualizar', products)
  })

  socket.on('deleteProduct', async ({ id, page }) => {
    try {
      // Find the product by its ID
      const product = await productDAO.getById(id);

      if (!product) {
        console.error('Product not found.');
        return;
      }

      // Find the user by the product's owner email
      const user = await userDAO.getByEmail(product.owner);

      if (user && user.role === 'premium') {
        // If the product belongs to a premium user, send the deletion email
        const emailSubject = 'Product Deletion Notification';
        const emailBody = `The product "${product.title}" has been deleted from your account.`;

        await sendPasswordRecoveryEmail(user.email, emailSubject, emailBody);
      }

      // Delete the product
      await productDAO.delete(id);

      // Get the updated list of products
      const products = await productDAO.getAll();

      // Get the updated list of products with pagination
      const updatedProducts = await productDAO.getAll({}, { page });
      io.sockets.emit('actualizar', updatedProducts);
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  });

  socket.on('nuevoMensaje', async msg => {
    await messageDAO.add(msg)
    let messages = await messageDAO.getAll();

    // products = JSON.parse(products)
    io.sockets.emit('actualizarMsg', messages)
  })

  socket.on('deleteUser', async id => {
    await userDAO.delete(id)
    let users = await userDAO.getAll();

    io.sockets.emit('actualizar', users)
  })

})