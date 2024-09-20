const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    readBlogs: [{type:mongoose.Schema.Types.ObjectId, ref: 'Blog'}],
    likedBlogs: [{type:mongoose.Schema.Types.ObjectId, ref:'Blog'}],
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', UserSchema);
