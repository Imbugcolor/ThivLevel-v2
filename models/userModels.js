const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: Number,
        default: 0
    },
    phone: {
        type: String
    },
    address: {
        type: Object,
    },
    gender: {
        type: String, 
    },
    dateOfbirth: {
        type: String
    },
    imageProfile: {
        type: Object,
        default: {url: 'https://res.cloudinary.com/dnv2v2tiz/image/upload/v1679802559/instagram-avt-profile/unknow_fc0uaf.jpg'}
    },
    isVerifyPhone: {
        type: Boolean,
        default: false,
    },
    isLogSocialNetwork: {
        type: Boolean,
        default: false,
    },
    status: {
        type: Boolean,
        require: true,
        default: true
    }
},{
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)