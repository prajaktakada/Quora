
const mongoose = require("mongoose")
const userModel = require('../models/userModel')
const validator = require("../util/validator")
const questionModel = require('../models/questionModel')
const answerModel=require('../models/answerModel')


//POST /answer
const createanswer = async function (req, res) {
    try {
        const requestBody = req.body;
        TokenDetail = req.user
       
        if (!(TokenDetail === requestBody.userId)) {
            res.status(401).send({ status: false, message: "userId  and in token is not same" })
        }

        if (!validator.isValidRequestBody(requestBody )) {
            res.status(400).send({ status: false, message: 'Please provide requestBody details' })
            return
        }

        //extract params


        let {answeredBy,text,questionId } = requestBody

        //validation starts
        answeredBy=requestBody.userId
        if (!(validator.isValidObjectId(requestBody.userId))) {
            return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        }
        if (!validator.isValid(requestBody.userId)) {
            return res.status(401).send({ status: false, msg: "userId is required" })
        };

        if (!validator.isValid(text)) {
            res.status(400).send({ status: false, message: `text is required` })
            return
        };
       
        if (!validator.isValid(requestBody.questionId)) {
            res.status(400).send({ status: false, message: `userId is required` })
            return
        };

        
        const answerData = {answeredBy:answeredBy,text,questionId}
        const answer = await  answerModel.create(answerData);

        res.status(201).send(answer);

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });

    }
}

module.exports.createanswer=createanswer



//GET questions/:questionId/answer
const getanswerById = async (req, res) => {
    try {
        const questionId = req.params.questionId;
    
        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid id` })
        }

       const questionIdFound = await questionModel.findOne({ _id: questionId, isDeleted: false })
       if (!questionIdFound) {
      return res.status(404).send({ status: false, message: `question not found with given questionId` })
      }

        const answer = await answerModel.find({questionId:questionId});

        if (!answer) {
            return res.status(404).send({ status: false, message: `answer does not exit` })
        }

        return res.status(200).send({ status: true, message: 'Success', data: answer })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

module.exports.getanswerById=getanswerById




//PUT /answer/:answerId
const updateAnswer = async (req, res) => {
    try {
        
       requestbody = req.body;
        TokenDetail = req.user
        answerId =req.params.answerId

        if (!validator.isValidRequestBody(requestbody)) {
            res.status(400).send({ status: false, message: 'Please provide userId and questionId' });
            return
        }

        if (!validator.isValidObjectId(answerId)) {
            return res.status(400).send({ status: false, message: `${answerId} is not a valid answerId` })
        }
        
        const answerFound = await answerModel.findOne({_id:requestbody.answerId})
        if (!answerFound) {
            return res.status(404).send({ status: false, message: `answer Details not found with given UserId` })
        }
   
        //console.log(TokenDetail)
        //console.log(answerFound.answeredBy)

        if (!(TokenDetail == answerFound.answeredBy)) {
            res.status(401).send({ status: false, message: "userId in url param and in token is not same" })
        }

       

        let {text} = requestbody

        if (!validator.isValid(text)) {
            res.status(400).send({ status: false, message: `text is required` })
            return
        };
    

        const questionData = {text}

        const updated= await answerModel.findOneAndUpdate({_id:answerId}, questionData, { new: true })
        console.log(updated)
        res.status(200).send({ status: true, message: 'anser updated successfully', data: updated });
  

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.updateAnswer=updateAnswer



//DELETE answers/:answerId
    const deleteAnswer = async (req, res) => {
        try {
          
    let requestbody = req.body;
    let TokenDetail = req.user;
    if (!validator.isValidRequestBody(requestbody)) {
        res.status(400).send({ status: false, message: 'please provide valid requestbody' });
        return
    }
    let { userId, questionId } = requestbody
   
    // if (!validator.isValidObjectId(userId)) {
    //     return res.status(400).send({ status: false, message: `${userId} is not a valid userId` })
    // }

    //  if (!validator.isValidObjectId(questionId)) {
    //     return res.status(400).send({ status: false, message: `${questionId} is not a valid questionId` })
    // }

    answeredBy=requestbody.userId
    if (!(TokenDetail == requestbody.userId)) {
        return res.status(400).send({ status: false, message: "Userid are not mathched" })
    }
   let data = await answerModel.findOneAndUpdate({ answeredBy: userId, questionId: questionId }, { $set: { isDeleted: true, deletedAt: new Date() } })
    return res.status(200).send({ status: true, message: `delete successfully`,data:data })
} catch (err) {
    return res.status(500).send({ status: false, message: err.message })
}
}
    
    module.exports.deleteAnswer = deleteAnswer