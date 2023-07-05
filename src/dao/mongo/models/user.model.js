import mongoose from "mongoose"
import bcrypt from "bcrypt"
import { UserDAO } from "../classes/user.dao.js";
import mongoosePaginate from 'mongoose-paginate-v2';

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user', 'premium'], required: false, default: 'user' },
    passwordRecoveryToken: { type: String, default: null },
    passwordRecoveryTokenExpiration: { type: Date, default: null },
    documents: [{
        name: { type: String, enum: ['profileImage', 'productImage', 'identification', 'proofOfAddress', 'accountStatement'] },
        reference: { type: String }
    }],
    last_connection: { type: Date, default: null }
});

userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;

        if (this.email === 'adminCoder@coder.com') {
            this.role = 'admin';
        }

        next();
    } catch (error) {
        next(error);
    }
});

userSchema.plugin(mongoosePaginate);

const productDb = mongoose.model('users', userSchema)

export const userDAO = new UserDAO(productDb)

// modificar los imports de:
export const userModel = mongoose.model('users', userSchema);