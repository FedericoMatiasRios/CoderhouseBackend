export class UserDAO {
  #db
  constructor(db) {
    this.#db = db
  }

  //Generic
  async getAll(query = {}, options) {
    return await this.#db.paginate(query, options);
  }
}