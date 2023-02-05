const fs = require('fs')
class ProductManager {
    products

    constructor(path) {
        this.products = []
        this.path = path
    }

    async firstTime() {
        if (fs.existsSync(this.path)) {
            console.log("exists")
        } else {
            console.log("not exists")
            await fs.promises.writeFile(this.path, JSON.stringify(this.products))
        }
    }

    // métodos
    async addProduct({title, description, price, thumbnail, code, stock}) {
        const exists = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).some(e => e.code === code);
        if (exists) throw new Error('Code already exists');

        await this.products.push(new Product({title, description, price, thumbnail, code, stock}))
        fs.promises.writeFile(this.path, JSON.stringify(this.products))
    }

    async getProducts() {
        const get = await fs.promises.readFile(this.path, 'utf-8')
        return get
    }

    async getProductById(id) {
        //buscar en el arreglo el producto
        //especificando id
        const found = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).find(e => e.id == id)

        if (found === undefined) {
            throw new Error('Not found')
        } else {
            console.log("found")
            console.log(found)
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

productManager.firstTime().then(
    productManager.getProducts().then(products => console.log('getProducts: ', products)).then(
        productManager.addProduct({title: "producto prueba", description: "Este es un producto prueba", price: 200, thumbnail: "Sin imagen", code: "abc123", stock: 25}).then(
            productManager.getProducts().then(products => console.log('getProducts: ', products)).then(
                productManager.getProductById(1)
            )
        )
    )
)




//Error: Code already exists
//productManager.addProduct({title: "producto prueba", description: "Este es un producto prueba", price: 200, thumbnail: "Sin imagen", code: "abc123", stock: 25})


//Error: Not found
//productManager.getProductById(2)