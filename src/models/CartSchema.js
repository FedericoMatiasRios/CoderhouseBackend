import mongoose from 'mongoose'
import { MongooseManager } from '../dao/managers-mongoose/MongooseManager.js'
import mongoosePaginate from 'mongoose-paginate-v2';

const cartSchema = mongoose.Schema({
    products: [{type: Array, required: true}],
})

cartSchema.plugin(mongoosePaginate);

const cartDb = mongoose.model('carts', cartSchema)

export const cartManagerMongoose = new MongooseManager(cartDb)