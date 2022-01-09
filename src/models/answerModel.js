//answerModel.js

const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({

      answeredBy:{type: mongoose.Types.ObjectId,refs:'user',required:true},
      text: { type: String,trim: true},
      questionId:{type: mongoose.Types.ObjectId,refs:'question',required:true},
      deletedAt:{type:Date,default:null},
      isDeleted:{type:Boolean,default:false}

}, { timestamps: true })

module.exports = mongoose.model('answer',answerSchema)