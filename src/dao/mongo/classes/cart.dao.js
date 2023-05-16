export class CartDAO {
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
  async deleteProductFromCart(cartId, productId) {
    return await this.#db.updateOne({ _id: cartId }, { $pull: { products: { product: productId } } }).lean();
  }
  async updateCartProducts(cartId, products) {
    return await this.#db.updateOne({ _id: cartId }, { $set: { products: products } }).lean();
  }
  async updateProductQuantity(cartId, productId, quantity) {
    return await this.#db.updateOne(
      { _id: cartId, 'products.product': productId },
      { $set: { 'products.$[elem].quantity': quantity } },
      { arrayFilters: [{ 'elem.product': productId }] }
    ).lean();
  }
  async deleteAllProducts(cartId) {
    return await this.#db.updateOne(
      { _id: cartId },
      { $set: { products: [] } }
    ).lean();
  }
  async getByIdPopulate(id) {
    return await this.#db.findById(id)
      .populate({ path: 'products.product', model: 'products' })
      .lean();
  }
}