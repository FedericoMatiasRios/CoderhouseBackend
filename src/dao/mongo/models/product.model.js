import mongoose from 'mongoose'
import { ProductDAO } from '../classes/product.dao.js';
import mongoosePaginate from 'mongoose-paginate-v2';
import { userModel } from './user.model.js';

const productSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    thumbnails: [{ type: Array, required: true }],
    owner: { type: String, required: false }
});

productSchema.plugin(mongoosePaginate);

const productDb = mongoose.model('products', productSchema)

export const productDAO = new ProductDAO(productDb)