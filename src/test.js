import { mongoose } from 'mongoose'
import { MONGODB_CNX_STR } from './config.js'
// import { personasManager } from './managers/ProductManagerMongoose.js'

await mongoose.connect(MONGODB_CNX_STR)

// personasManager.addProduct({
//     asd: 'asd',
// })

console.log(mongoose.connection.readyState);
// 0: disconnected
// 1: connected
// 2: connecting
// 3: disconnecting

mongoose.connection.close()