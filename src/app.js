import { Server } from 'socket.io'
import { productDAO } from './dao/mongo/models/product.model.js'
import { app } from './routers/base.router.js'
import { mongoose } from 'mongoose'
import { messageDAO } from './dao/mongo/models/message.model.js'
import { mongodbCnxStr } from './config/config.js'
import { winstonLogger } from './utils/winstonLogger.js'

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

  socket.on('deleteProduct', async id => {
    // await productDAO.firstTime()
    // await productDAO.deleteProduct(id)
    // let products = await productDAO.getProducts();
    await productDAO.delete(id)
    let products = await productDAO.getAll();

    // products = JSON.parse(products)
    io.sockets.emit('actualizar', products)
  })

  socket.on('nuevoMensaje', async msg => {
    await messageDAO.add(msg)
    let messages = await messageDAO.getAll();

    // products = JSON.parse(products)
    io.sockets.emit('actualizarMsg', messages)
  })
})