import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], required: false, default: 'user' }
})

userSchema.pre('save', async function(next) {
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

export const userModel = mongoose.model('users', userSchema)