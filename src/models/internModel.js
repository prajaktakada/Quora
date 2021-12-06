const mongoose = require('mongoose')

const regexMobile = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;

const validateMobile = function(mobile) {
    return regexMobile.test(mobile)
}

const internSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'First name is required',
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: {
            validator: function (email) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
            }, message: 'Please fill a valid email address', isAsync: false
        }
    },
    mobile: {
        type: Number,
        required: 'phone number is required',
        unique: true,
        validate: {
            validator: validateMobile, message: 'Please fill a valid number', isAsync: false
        }
    },
    collegeId: {
        required: 'collegeId  is required',
        type: mongoose.Types.ObjectId,
        refs: 'College'
    },

    isDeleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

module.exports = mongoose.model('Intern', internSchema)