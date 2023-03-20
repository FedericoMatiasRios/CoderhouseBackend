import mongoose from 'mongoose'
import { MongooseManager } from './MongooseManager.js'

const productSchema = mongoose.Schema({
    title: {type: String, required: true}, 
    description: {type: String, required: true}, 
    code: {type: String, required: true}, 
    price: {type: Number, required: true}, 
    status: {type: Boolean, default: true},
    stock: {type: Number, required: true}, 
    category: {type: String, required: true}, 
    thumbnails: [{type: Array, required: true}], 
})

const productDb = mongoose.model('products', productSchema)

export const productsManagerMongoose = new MongooseManager(productDb)