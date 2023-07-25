export class UserDAO {
  #db
  constructor(db) {
    this.#db = db
  }

  async updateUserCart(userId, cartId) {
    try {
      await this.#db.updateOne({ _id: userId }, { cart: cartId });
    } catch (err) {
      console.error('Error updating user cart:', err);
      throw err;
    }
  }

  async getByEmail(email) {
    return await this.#db.findOne({ email: email }).lean();
  }

  //Generic
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