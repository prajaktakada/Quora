//questionModel
 const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
      description: { type: String, required:true },
      tag: [{ type: [String],trim: true}],
      askedBy:{type: mongoose.Types.ObjectId,refs:'user'},
      deletedAt:{type:Date,default:null},
      isDeleted:{type: Boolean,default: false} //
        
}, { timestamps: true })

module.exports = mongoose.model('question',questionSchema)