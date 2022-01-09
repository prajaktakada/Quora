const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    fname: {type: String,required: true,trim:true},
    lname: {type: String,required: true,trim:true},
    email: { type: String,required: true,unique: true},//validemail
    phone:{type:String,trim: true,unique:true},// valid Indian mobile number
    password:{type: String,required: true},
    creditScore:{type:Number,required:true,default:500} 

}, { timestamps: true })

module.exports = mongoose.model('user', userSchema)