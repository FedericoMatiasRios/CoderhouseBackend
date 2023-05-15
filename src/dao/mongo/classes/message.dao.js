export class MessageDAO {
    #db
    constructor(db) {
      this.#db = db
    }
  
    //Generic
    async add(prod) {
      await this.#db.create(prod)
      return prod
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
  }