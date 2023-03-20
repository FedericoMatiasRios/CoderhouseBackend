export class MongooseManager {
    #db
    constructor(db) {
        this.#db = db
    }
   
    async addProduct(prod) {
        await this.#db.create(prod)
        return prod
    }

    async getProducts() {
        return await this.#db.find()
    }

    async getProductById(id) {
        return await this.#db.findOne({_id: id})
    }

    async updateProduct(id, newProd) {
        return await this.#db.replaceOne({id}, newProd)
    }

    async deleteProduct(id) {
        return await this.#db.deleteOne({id})
    }

    //Carts
    async newCart(products) {
        await this.#db.create(products)
    }

    async getCarts() {
        return await this.#db.find()
    }

    async getCartById(id) {
        return await this.#db.findOne({_id: id})
    }

    async addToCart({product, quantity = 1}) {     
        await this.#db.create({product, quantity})
        return prod 
    }
}