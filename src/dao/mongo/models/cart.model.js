import mongoose from 'mongoose'
import { CartDAO } from '../classes/cart.dao.js';
import mongoosePaginate from 'mongoose-paginate-v2';


const cartSchema = mongoose.Schema({
    products: [{type: Array, required: true}],
})

cartSchema.plugin(mongoosePaginate);

const cartDb = mongoose.model('carts', cartSchema)

export const cartDAO = new CartDAO(cartDb)