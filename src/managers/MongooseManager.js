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
        const products = await this.#db.findOne({_id: id})
        if (newProd.title === undefined) {newProd.title = products.title;}
        if (newProd.description === undefined) {newProd.description = products.description;}
        if (newProd.code === undefined) {newProd.code = products.code;}
        if (newProd.price === undefined) {newProd.price = products.price;}
        if (newProd.status === undefined) {newProd.status = products.status;}
        if (newProd.stock === undefined) {newProd.stock = products.stock;}
        if (newProd.category === undefined) {newProd.category = products.category;}
        if (newProd.thumbnails === undefined) {newProd.thumbnails = products.thumbnails;}
        return await this.#db.replaceOne({_id: id}, newProd).lean()
    }

    async deleteProduct(id) {
        return await this.#db.deleteOne({_id: id}).lean()
    }

    //Carts
    async newCart(products) {
        await this.#db.create(products)
        return products
    }

    async getCarts() {
        return await this.#db.find().lean()
    }

    async getCartById(id) {
        return await this.#db.findOne({_id: id}).lean()
    }

    async addToCart(id, {product, quantity = 1}) {

        const cart = await this.#db.findOne({_id: id})
        
        if (product !== undefined && quantity !== undefined) {
            if (cart.products.quantity){
                // cart.quantity += 1
                const cartX = await this.#db.findOneAndUpdate({_id :id}, { $inc: { 'products.quantity': 1 }})
                
                console.log(cartX)
                console.log("Updated")
            } else {
                // this.carts.find(e => e.id == id).products.push({product, quantity});

                this.#db.findOne(
                    { _id: id }, 
                    { $push: {products: 'new data'}},
                )
                .then(updateDoc =>{
                    console.log('success', updateDoc)
                })
                .catch(err => {
                    console.error(err);
                })

                console.log("Added")
            }
        }
        // return await this.#db.create({product, quantity})
    }
}