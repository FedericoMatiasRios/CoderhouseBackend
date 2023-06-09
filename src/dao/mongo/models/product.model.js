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
    owner: {
        type: String,
        validate: {
            validator: async function (value) {
                if (value === 'admin') {
                    return true; // Allow 'admin' as the owner
                }

                const user = await userModel.findOne({ email: value }).select('role');

                if (user) {
                    if (user.role === 'premium') {
                        return true; // Allow the email as the owner value for premium users
                    }
                }

                return false; // Reject the owner value if the user is not found or has a different role
            },
            message: 'Only users with premium or admin role can be assigned as product owners',
            type: 'user defined',
        },
    },
});

productSchema.plugin(mongoosePaginate);

const productDb = mongoose.model('products', productSchema)

export const productDAO = new ProductDAO(productDb)