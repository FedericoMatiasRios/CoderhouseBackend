import mongoose from 'mongoose'
import { MessageDAO } from '../classes/message.dao.js';
import mongoosePaginate from 'mongoose-paginate-v2';

const messageSchema = mongoose.Schema({
    user: {type: String, required: true}, 
    message: {type: String, required: true},
})

messageSchema.plugin(mongoosePaginate);

const messagesDb = mongoose.model('messages', messageSchema)

export const messageDAO = new MessageDAO(messagesDb)