import mongoose from 'mongoose'
import { MongooseManager } from '../dao/managers-mongoose/MongooseManager.js'

const messageSchema = mongoose.Schema({
    user: {type: String, required: true}, 
    message: {type: String, required: true},
})

const messagesDb = mongoose.model('messages', messageSchema)

export const messagesManagerMongoose = new MongooseManager(messagesDb)