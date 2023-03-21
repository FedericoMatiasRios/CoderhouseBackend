export class MongooseManager {
    #db
    constructor(db) {
        this.#db = db
    }
    
    //Generic
    async add(prod) {
        await this.#db.create(prod)
        return prod
    }

    async getAll() {
        return await this.#db.find().lean()
    }

    async getById(id) {
        return await this.#db.findOne({_id: id}).lean()
    }

    //Products
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
    async addToCart(id, { product, quantity = 1 }) {
        if (!product || !quantity) {
          return;
        }
      
        const existingProduct = await this.#db.findOneAndUpdate(
          { _id: id, 'products.product': product },
          { $inc: { 'products.$.quantity': quantity } },
          { new: true }
        );
      
        if (existingProduct) {
          console.log('Cart updated:', existingProduct);
          return;
        }
            
        const newProduct = { product, quantity };
        const updatedCart = await this.#db.findOneAndUpdate(
          { _id: id },
          { $push: { products: newProduct } },
          { new: true }
        );
      
        console.log('Cart updated:', updatedCart);
      }
}