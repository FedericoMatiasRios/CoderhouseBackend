export class UserDAO {
  #db
  constructor(db) {
    this.#db = db
  }

  //Generic
  async getAll(query = {}, options) {
    return await this.#db.paginate(query, options);
  }

  async getByEmail(email) {
    return await this.#db.findOne({ email: email }).lean();
  }

  async delete(id) {
    return await this.#db.deleteOne({ _id: id }).lean()
  }
}