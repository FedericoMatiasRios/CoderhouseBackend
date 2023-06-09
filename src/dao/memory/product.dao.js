import fs from 'fs'
import { errors } from '../../services/errors.service'
import { winstonLogger } from '../../utils/winstonLogger'

export class ProductDAO {
    products

    constructor(path) {
        this.products = []
        this.path = path
    }

    async firstTime() {
        if (fs.existsSync(this.path)) {
            // si el .json existe, copiar su valor
            this.products = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'))
        } else {
            // si no existe, crearlo
            await fs.promises.writeFile(this.path, JSON.stringify(this.products))
        }
    }

    // métodos
    async addProduct({ title, description, code, price, status, stock, category, thumbnails, id }) {

        if (!title) throw new Error('Title is missing.')
        if (!description) throw new Error('Description is missing.')
        if (!code) throw new Error('Code is missing.')
        if (!price) throw new Error('Price is missing.')
        if (!stock) throw new Error('Stock is missing.')
        if (!category) throw new Error('Category is missing.')

        let getId = Math.max(...JSON.parse(await fs.promises.readFile('./database/products.json', 'utf-8')).map(o => o.id))

        if (getId > 0) {
            id = getId + 1
        } else {
            id = 1
        }

        const exists = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).some(e => e.code === code);
        if (exists) throw new Error('Code already exists');

        await this.products.push(new Product({ title, description, code, price, status, stock, category, thumbnails, id }))
        await fs.promises.writeFile(this.path, JSON.stringify(this.products))
    }

    async getProducts() {
        const get = await fs.promises.readFile(this.path, 'utf-8')
        return (get);
    }

    async getProductById(id) {
        //buscar en el arreglo el producto
        //especificando id
        const found = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).find(e => e.id == id)

        if (found === undefined) {
            return ('Not found')
        } else {
            return (found)
        }
    }

    async updateProduct(id, { title, description, code, price, status, stock, category, thumbnails }, req) {
        const found = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).find(e => e.id == id)

        if (found === undefined) {
            throw new Error(errors.ERROR_NOT_FOUND)
        } else {
            if (title !== undefined) { this.products.find(e => e.id == id).title = title; }
            if (description !== undefined) { this.products.find(e => e.id == id).description = description; }
            if (code !== undefined) { this.products.find(e => e.id == id).code = code; }
            if (price !== undefined) { this.products.find(e => e.id == id).price = price; }
            if (status !== undefined) { this.status.find(e => e.id == id).status = status; }
            if (stock !== undefined) { this.products.find(e => e.id == id).stock = stock; }
            if (category !== undefined) { this.products.find(e => e.id == id).category = category; }
            if (thumbnails !== undefined) { this.products.find(e => e.id == id).thumbnails = thumbnails; }
            req.logger.info("Updated")
        }

        await fs.promises.writeFile(this.path, JSON.stringify(this.products))
    }

    async deleteProduct(id, req) {
        const found = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).find(e => e.id == id)

        if (found === undefined) {
            throw new Error(errors.ERROR_NOT_FOUND)
        } else {
            let index = this.products.findIndex(e => e.id == id);
            this.products.splice(index, 1)
            await fs.promises.writeFile(this.path, JSON.stringify(this.products))
            req.logger.info("Deleted product with id:" + id)
        }
    }
}

class Product {

    static id = 0;

    title
    description
    code
    price
    status
    stock
    category
    thumbnails

    constructor({ title, description, code, price, status, stock, category, thumbnails, id }) {

        if (code == undefined) {
            throw new Error(errors.ERROR_NOT_FOUND)
        }

        this.id = id;
        this.title = title
        this.description = description
        this.code = code
        this.price = price
        this.status = true
        this.stock = stock
        this.category = category
        this.thumbnails = thumbnails
    }
}

const productDAO = new ProductDAO('./database/products.json')

//async function runTest() {
//    await productDAO.firstTime()
//    await productDAO.getProducts()
//    await productDAO.addProduct({title: "producto prueba", description: "Este es un producto prueba", price: 200, thumbnail: "Sin imagen", code: "abc123", stock: 25})
//    await productDAO.addProduct({title: "title 2", description: "description 2", price: 200, thumbnail: "Sin imagen", code: "222", stock: 25})
//    await productDAO.addProduct({title: "title 3", description: "description 3", price: 200, thumbnail: "Sin imagen", code: "333", stock: 25})
//    await productDAO.getProducts()
//    await productDAO.getProductById(1)
//    await productDAO.updateProduct(1, {title: "updated"})
//    await productDAO.getProductById(1)
//    await productDAO.deleteProduct(1)
//    await productDAO.getProducts()
//  }

// runTest()

//Error: Code already exists
//productDAO.addProduct({title: "producto prueba", description: "Este es un producto prueba", price: 200, thumbnail: "Sin imagen", code: "abc123", stock: 25})

// productDAO.getProductById(1)

//Error: Not found
//productDAO.getProductById(2)