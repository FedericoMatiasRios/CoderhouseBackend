import mongoose from 'mongoose'
import { MongooseManager } from '../dao/managers-mongoose/MongooseManager.js'
import mongoosePaginate from 'mongoose-paginate-v2';

const messageSchema = mongoose.Schema({
    user: {type: String, required: true}, 
    message: {type: String, required: true},
})

messageSchema.plugin(mongoosePaginate);

const messagesDb = mongoose.model('messages', messageSchema)

export const messagesManagerMongoose = new MongooseManager(messagesDb)