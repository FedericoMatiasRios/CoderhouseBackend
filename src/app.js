import { Server } from 'socket.io'
import { productsManagerMongoose } from './models/ProductSchema.js'
import { app } from './routers/routers.js'
import { productManager } from "./controllers/controllers.js"

import { mongoose } from 'mongoose'
import { MONGODB_CNX_STR } from './config/config.js'
await mongoose.connect(MONGODB_CNX_STR, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'ecommerce',
  })
  .then(() => {
    console.log('Connected to Mongo Database.');
  })
  .catch(err => console.error(err));

const puerto = 8080
const servidorConectado = app.listen(puerto, ()=> { console.log('Connected.') })

const io = new Server(servidorConectado)
io.on('connection', socket => {
    console.log('New client connected!')

    socket.on('nuevoProducto', async prod => {
        // await productManager.firstTime()
        // await productManager.addProduct(prod)
        // let products = await productManager.getProducts();

        await productsManagerMongoose.addProduct(prod)
        let products = await productsManagerMongoose.getProducts();

        // products = JSON.parse(products)
        io.sockets.emit('actualizar', products)
    })

    socket.on('deleteProduct', async id => {
        // await productManager.firstTime()
        // await productManager.deleteProduct(id)
        // let products = await productManager.getProducts();
        await productsManagerMongoose.deleteProduct(id)
        let products = await productsManagerMongoose.getProducts();

        // products = JSON.parse(products)
        io.sockets.emit('actualizar', products)
    })
})