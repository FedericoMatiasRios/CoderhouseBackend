export class ProductDAO {
    #db
    constructor(db) {
      this.#db = db
    }
  
    //Generic
    async add(prod) {
      const createdProduct = await this.#db.create(prod);
      return createdProduct
    }
  
    async getAll(query = {}, options) {
      return await this.#db.paginate(query, options);
    }
  
    async getById(id) {
      return await this.#db.findOne({ _id: id }).lean()
    }
  
    async delete(id) {
      return await this.#db.deleteOne({ _id: id }).lean()
    }
  
    //Products
    async updateProduct(id, newProd) {
      const products = await this.#db.findOne({ _id: id })
      if (newProd.title === undefined) { newProd.title = products.title; }
      if (newProd.description === undefined) { newProd.description = products.description; }
      if (newProd.code === undefined) { newProd.code = products.code; }
      if (newProd.price === undefined) { newProd.price = products.price; }
      if (newProd.status === undefined) { newProd.status = products.status; }
      if (newProd.stock === undefined) { newProd.stock = products.stock; }
      if (newProd.category === undefined) { newProd.category = products.category; }
      if (newProd.thumbnails === undefined) { newProd.thumbnails = products.thumbnails; }
      return await this.#db.replaceOne({ _id: id }, newProd).lean()
    }
  }