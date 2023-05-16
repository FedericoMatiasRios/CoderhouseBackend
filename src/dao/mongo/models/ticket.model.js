import mongoose from 'mongoose'
import { TicketDAO } from '../classes/ticket.dao.js'
import { userModel } from './user.model.js'

const ticketSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  purchase_datetime: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true, ref: 'users' }
})

ticketSchema.pre('save', async function (next) {
  try {
    if (!this.purchaser) {
      const email = this._user.email
      const user = await userModel.findOne({ email })
      this.purchaser = user._id
    }
    next()
  } catch (error) {
    next(error)
  }
})

const ticketDb = mongoose.model('tickets', ticketSchema)

export const ticketDAO = new TicketDAO(ticketDb)