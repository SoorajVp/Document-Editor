// models/YourModel.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    docs: [String]
});

const userModel = mongoose.model('user', userSchema);

export default userModel
