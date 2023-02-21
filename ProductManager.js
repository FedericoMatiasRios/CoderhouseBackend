import fs from 'fs'

export class ProductManager {
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
    async addProduct({title, description, code, price, status, stock, category, thumbnails, id}) {
        
        if(!title) throw new Error('Title is missing.')
        if(!description) throw new Error('Description is missing.')
        if(!code) throw new Error('Code is missing.')
        if(!price) throw new Error('Price is missing.')
        if(!stock) throw new Error('Stock is missing.')
        if(!category) throw new Error('Category is missing.')
        id = Math.max(...JSON.parse(await fs.promises.readFile('./products.json', 'utf-8')).map(o => o.id)) + 1;
        
        const exists = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).some(e => e.code === code);
        if (exists) throw new Error('Code already exists');

        await this.products.push(new Product({title, description, code, price, status, stock, category, thumbnails, id}))
        await fs.promises.writeFile(this.path, JSON.stringify(this.products))
    }

    async getProducts() {
        const get = await fs.promises.readFile(this.path, 'utf-8')
        return(get);
    }

    async getProductById(id) {
        //buscar en el arreglo el producto
        //especificando id
        const found = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).find(e => e.id == id)

        if (found === undefined) {
            return('Not found')
        } else {
            return(found)
        }
    }

    async updateProduct(id, {title, description, code, price, status, stock, category, thumbnails}) {
        const found = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).find(e => e.id == id)

        if (found === undefined) {
            throw new Error('Not found')
        } else {
            if (title !== undefined) {this.products.find(e => e.id == id).title = title;}
            if (description !== undefined) {this.products.find(e => e.id == id).description = description;}
            if (code !== undefined) {this.products.find(e => e.id == id).code = code;}
            if (price !== undefined) {this.products.find(e => e.id == id).price = price;}
            if (status !== undefined) {this.status.find(e => e.id == id).status = status;}
            if (stock !== undefined) {this.products.find(e => e.id == id).stock = stock;}
            if (category !== undefined) {this.products.find(e => e.id == id).category = category;}
            if (thumbnails !== undefined) {this.products.find(e => e.id == id).thumbnails = thumbnails;}
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
    
    title
    description
    code
    price
    status
    stock
    category
    thumbnails

    constructor({title, description, code, price, status, stock, category, thumbnails, id}) {

        if (code == undefined) {
            throw new Error('Not Found')
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

const productManager = new ProductManager('./products.json')

//async function runTest() {
//    await productManager.firstTime()
//    await productManager.getProducts()
//    await productManager.addProduct({title: "producto prueba", description: "Este es un producto prueba", price: 200, thumbnail: "Sin imagen", code: "abc123", stock: 25})
//    await productManager.addProduct({title: "title 2", description: "description 2", price: 200, thumbnail: "Sin imagen", code: "222", stock: 25})
//    await productManager.addProduct({title: "title 3", description: "description 3", price: 200, thumbnail: "Sin imagen", code: "333", stock: 25})
//    await productManager.getProducts()
//    await productManager.getProductById(1)
//    await productManager.updateProduct(1, {title: "updated"})
//    await productManager.getProductById(1)
//    await productManager.deleteProduct(1)
//    await productManager.getProducts()
//  }

// runTest()

//Error: Code already exists
//productManager.addProduct({title: "producto prueba", description: "Este es un producto prueba", price: 200, thumbnail: "Sin imagen", code: "abc123", stock: 25})

// productManager.getProductById(1)

//Error: Not found
//productManager.getProductById(2)