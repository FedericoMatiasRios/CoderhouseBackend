import mongoose from 'mongoose'
import { MongooseManager } from './MongooseManager.js'

const cartSchema = mongoose.Schema({
    products: [{type: Array, required: true}],
})

const cartDb = mongoose.model('carts', cartSchema)

export const cartManagerMongoose = new MongooseManager(cartDb)