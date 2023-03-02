import { Server } from 'socket.io'
import { app, productManager } from './routers.js'

const puerto = 8080
const servidorConectado = app.listen(puerto, ()=> { console.log('Connected.') })

const io = new Server(servidorConectado)
io.on('connection', socket => {
    console.log('New client connected!')

    socket.on('nuevoProducto', async prod => {
        await productManager.firstTime()
        await productManager.addProduct(prod)
        let products = await productManager.getProducts();
        products = JSON.parse(products)
        io.sockets.emit('actualizar', products)
    })

    socket.on('deleteProduct', async id => {
        await productManager.firstTime()
        await productManager.deleteProduct(id)
        let products = await productManager.getProducts();
        products = JSON.parse(products)
        io.sockets.emit('actualizar', products)
    })
})