export class TicketDAO {
  #db
  constructor(db) {
    this.#db = db
  }

  //Generic
  async create(ticket) {
    await this.#db.create(ticket)
    return ticket
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