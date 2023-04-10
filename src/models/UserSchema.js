import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    password: { type: String, default: true },
    role: { type: String, enum: ['admin', 'user'], required: false, default: 'user' }
})

userSchema.pre('save', function (next) {
    if (this.email === 'adminCoder@coder.com') {
        this.role = 'admin';
    }
    next();
});

export const userModel = mongoose.model('users', userSchema);