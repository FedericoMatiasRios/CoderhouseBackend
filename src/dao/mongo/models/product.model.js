import mongoose from 'mongoose'
import { ProductDAO } from '../classes/product.dao.js';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: Boolean, default: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    thumbnails: [{ type: Array, required: true }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: 'admin',
        required: true,
        validate: {
            validator: async function (value) {
                const user = await mongoose.model('User').findOne({ _id: value, role: 'premium' });
                return !!user;
            },
            message: 'Only users with premium role can be assigned as product owners',
        },
    },
});

productSchema.plugin(mongoosePaginate);

const productDb = mongoose.model('products', productSchema)

export const productDAO = new ProductDAO(productDb)