class ProductManager {
    products

    constructor() {
        this.products = []
    }

    // métodos
    addProduct({title, description, price, thumbnail, code, stock}) {
        const exists = this.products.some(e => e.code === code);
        if (exists) throw new Error('Code already exists');

        this.products.push(new Product({title, description, price, thumbnail, code, stock}))
    }

    getProducts() {
        //devolver todos los productos
        return this.products
    }

    getProductById(id) {
        //buscar en el arreglo el producto
        //especificando id
        const found = this.products.find(e => e.id == id)

        if (found === undefined) {
            throw new Error('Not found')
        } else {
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

const productManager = new ProductManager()

console.log(productManager.getProducts())

productManager.addProduct({title: "producto prueba", description: "Este es un producto prueba", price: 200, thumbnail: "Sin imagen", code: "abc123", stock: 25})

console.log(productManager.getProducts())

//Error: Code already exists
//productManager.addProduct({title: "producto prueba", description: "Este es un producto prueba", price: 200, thumbnail: "Sin imagen", code: "abc123", stock: 25})

productManager.getProductById(1)

//Error: Not found
//productManager.getProductById(2)