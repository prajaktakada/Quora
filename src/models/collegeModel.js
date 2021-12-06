const mongoose = require('mongoose')

const collegeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'First name is required',
        unique: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: 'Last name is required',
        trim: true,
    },
    logoLink: {
        type: String,
        trim: true,
        required: 'Title is required',
    },
    isDeleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

module.exports = mongoose.model('College', collegeSchema)