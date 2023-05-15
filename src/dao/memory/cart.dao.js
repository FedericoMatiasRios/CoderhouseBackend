import fs from 'fs'

export class CartDAO {
    carts

    constructor(path) {
        this.carts = []
        this.path = path
    }

    async firstTime() {
        if (fs.existsSync(this.path)) {
            // si el .json existe, copiar su valor
            this.carts = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'))
        } else {
            // si no existe, crearlo
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts))
        }
    }

    // métodos
    async newCart({id, products}) {
        
        if(!products) throw new Error('Products are missing.')

        let getId = Math.max(...JSON.parse(await fs.promises.readFile('./database/carts.json', 'utf-8')).map(o => o.id))
        
        if(getId > 0){
            id = getId + 1
        } else {
            id = 1
        }

        await this.carts.push(new Cart({id, products}))
        await fs.promises.writeFile(this.path, JSON.stringify(this.carts))
    }

    async getCarts() {
        const get = await fs.promises.readFile(this.path, 'utf-8')
        return(get);
    }

    async getCartById(id) {
        //buscar en el arreglo el producto
        //especificando id
        const found = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).find(e => e.id == id)

        if (found === undefined) {
            return('Not found')
        } else {
            return(found)
        }
    }

    async addToCart(id, {product, quantity = 1}) {
        const found = JSON.parse(await fs.promises.readFile(this.path, 'utf-8')).find(e => e.id == id)

        if (found === undefined) {
            throw new Error('Not found')
        } else {
            if (product !== undefined && quantity !== undefined) {
                if (this.carts.find(e => e.id == id).products.find(e => e.product == product)){
                    this.carts.find(e => e.id == id).products.find(e => e.product == product).quantity += 1
                    console.log("Updated")
                } else {
                    this.carts.find(e => e.id == id).products.push({product, quantity});
                    console.log("Added")
                }
            }
        }
        
        await fs.promises.writeFile(this.path, JSON.stringify(this.carts))        
    }
}

class Cart {

    static id = 0;
    
    products

    constructor({id, products}) {
        this.id = id;
        this.products = products
    }
}

const cartDAO = new CartDAO('./database/carts.json')

// async function runTest() {
//    await cartDAO.firstTime()
//    await cartDAO.newCart({products: []})
//    await cartDAO.getCarts()
//    await cartDAO.addToCart(1, {product: 7})
//  }

//runTest();