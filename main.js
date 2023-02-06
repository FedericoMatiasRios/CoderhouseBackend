const fs = require('fs')

class ProductManager {
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
    async addProduct({title, description, price, thumbnail, code, stock}) {
        const exists = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).some(e => e.code === code);
        if (exists) throw new Error('Code already exists');

        await this.products.push(new Product({title, description, price, thumbnail, code, stock}))
        await fs.promises.writeFile(this.path, JSON.stringify(this.products))
    }

    async getProducts() {
        const get = await fs.promises.readFile(this.path, 'utf-8')
        console.log(get);
    }

    async getProductById(id) {
        //buscar en el arreglo el producto
        //especificando id
        const found = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).find(e => e.id == id)

        if (found === undefined) {
            throw new Error('Not found')
        } else {
            console.log(found)
        }
    }

    async updateProduct(id, {title, description, price, thumbnail, code, stock}) {
        const found = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).find(e => e.id == id)

        if (found === undefined) {
            throw new Error('Not found')
        } else {
            if (title !== undefined) {this.products[id-1].title = title;}
            if (description !== undefined) {this.products[id-1].description = description;}
            if (price !== undefined) {this.products[id-1].price = price;}
            if (thumbnail !== undefined) {this.products[id-1].thumbnail = thumbnail;}
            if (code !== undefined) {this.products[id-1].code = code;}
            if (stock !== undefined) {this.products[id-1].stock = stock;}
            console.log("Updated")
        }
        
        await fs.promises.writeFile(this.path, JSON.stringify(this.products))        
    }

    async deleteProduct(id) {
        const found = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).find(e => e.id == id)

        if (found === undefined) {
            throw new Error('Not found')
        } else {
            this.products.splice(id-1, 1)
            await fs.promises.writeFile(this.path, JSON.stringify(this.products))
            console.log("Deleted")
        }
    }
}

class Product {

    static id = 0;

    static incrementId() {
        this.id++; 
    }
    
    title
    description
    price
    thumbnail
    code
    stock

    constructor({title, description, price, thumbnail, code, stock}) {

        if (code == undefined) {
            throw new Error('Not Found')
        }

        Product.incrementId();
        this.id = Product.id;
        this.title = title
        this.description = description
        this.price = price
        this.thumbnail = thumbnail
        this.code = code
        this.stock = stock
    }
}

const productManager = new ProductManager('./products.json')

async function runTest() {
    await productManager.firstTime()
    await productManager.getProducts()
    await productManager.addProduct({title: "producto prueba", description: "Este es un producto prueba", price: 200, thumbnail: "Sin imagen", code: "abc123", stock: 25})
    await productManager.getProducts()
    await productManager.getProductById(1)
    await productManager.updateProduct(1, {title: "updated"})
    await productManager.getProductById(1)
    await productManager.deleteProduct(1)
    await productManager.getProducts()
  }

runTest()

//Error: Code already exists
//productManager.addProduct({title: "producto prueba", description: "Este es un producto prueba", price: 200, thumbnail: "Sin imagen", code: "abc123", stock: 25})

// productManager.getProductById(1)

//Error: Not found
//productManager.getProductById(2)