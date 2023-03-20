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
        return await this.#db.find().lean()
    }

    async getProductById(id) {
        return await this.#db.findOne({_id: id}).lean()
    }

    async updateProduct(id, newProd) {
        return await this.#db.replaceOne({id}, newProd).lean()
    }

    async deleteProduct(id) {
        return await this.#db.deleteOne({id}).lean()
    }

    //Carts
    async newCart(products) {
        await this.#db.create(products).lean()
    }

    async getCarts() {
        return await this.#db.find().lean()
    }

    async getCartById(id) {
        return await this.#db.findOne({_id: id}).lean()
    }

    async addToCart({product, quantity = 1}) {     
        return await this.#db.create({product, quantity}).lean()
    }
}