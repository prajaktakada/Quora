
const mongoose = require("mongoose")
const userModel = require('../models/userModel')
const validator = require("../util/validator")
const questionModel = require('../models/questionModel')
const answerModel = require('../models/answerModel')


//POST /answer
const createanswer = async function (req, res) {
    try {
        const requestBody = req.body;
        TokenDetail = req.user

        if (!(TokenDetail === requestBody.userId)) {
          return res.status(401).send({ status: false, message: "userId  and in token is not same" })
        }

        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Please provide requestBody details' })
            return
        }
//
let questionfind = await questionModel.findOne({_id:requestBody.questionId})
//console.log(questionfind)
if(questionfind.askedBy == requestBody.userId){
    return res.status(400).send({status:false,msg:"you can not wirte question as well as answer"})
}
//
        //extract params

        let { answeredBy, text, questionId } = requestBody

        //validation starts
        answeredBy = requestBody.userId
        console.log(answeredBy)
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

        const answerData = { answeredBy:answeredBy, text, questionId }
        const answer = await answerModel.create(answerData);


//

if(answer){

    let deductCreditScore = await userModel.findById({_id:requestBody.userId})  
    scrore = deductCreditScore.creditScore+200
    let update = await userModel.findOneAndUpdate({_id:deductCreditScore},{creditScore:scrore})
    console.log(update)
    
    }
   // 
      return res.status(201).send(answer);

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });

    }
}

module.exports.createanswer = createanswer



//GET questions/:questionId/answer
const getanswerById = async (req, res) => {
    try {
        const questionId = req.params.questionId;

        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid id` })
        }

        const questionIdFound = await questionModel.findOne({ _id:questionId,isDeleted: false }) //deletedAt:null 
        if (!questionIdFound) {
            return res.status(404).send({ status: false, message: `Answer is not found with given questionId` })
        }


        const answer = await answerModel.find({ questionId: questionId,isDeleted:false}).sort({createdAt:-1});

        if (!answer) {
            return res.status(404).send({ status: false, message: `answer does not exit` })
        }
       
        // if (!answer.isDeleted == false) {  //&& answer.deletedAt == null 
        //     return res.status(400).send({ status: false, message: "Answer is deleted" })
        // }

        let newdata = {
            // //name: collegeDetail.name, 
            // description:questionIdFound.description,
            // tag:questionIdFound.tag,
            // askedBy:questionIdFound.askedBy,
            // isDeleted:questionIdFound.isDeleted,
            answer: answer


        }

        return res.status(200).send({ status: true, message: 'Success', data: newdata })

        //return res.status(200).send({ status: true, message: 'Success', data: answer })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

module.exports.getanswerById = getanswerById




//PUT /answer/:answerId
const updateAnswer = async (req, res) => {
    try {

        requestbody = req.body;
        TokenDetail = req.user
        answerId = req.params.answerId
        console.log(answerId)


        if (!validator.isValidRequestBody(requestbody)) {
            res.status(400).send({ status: false, message: 'Please provide userId and questionId' });
            return
        }

        if (!validator.isValidObjectId(answerId)) {
            return res.status(400).send({ status: false, message: `${answerId} is not a valid answerId` })
        }

        const answerFound = await answerModel.findOne({ _id: answerId })
        //console.log(answerFound)
        if (answerFound.isDeleted == true) { //&& answerFound.deletedAt == null 
            return res.status(400).send({ status: false, message: "Answer not exists,it is deleted" })
        }

        if (!answerFound) {
            return res.status(404).send({ status: false, message: `answer Details not found with given UserId` })
        }

        //console.log(TokenDetail)
        //console.log(answerFound.answeredBy)

        if (!(TokenDetail == answerFound.answeredBy)) {
         return res.status(401).send({ status: false, message: "userId in url param and in token is not same" })
        }

        let { text } = requestbody

        if (!validator.isValid(text)) {
            res.status(400).send({ status: false, message: `text is required` })
            return
        };


        const questionData = { text }

        const updated = await answerModel.findOneAndUpdate({ _id: answerId }, questionData, { new: true })
        console.log(updated)
        res.status(200).send({ status: true, message: 'anser updated successfully', data: updated });


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.updateAnswer = updateAnswer



//DELETE answers/:answerId
const deleteAnswer = async (req, res) => {
    try {

        let answerId=req.params.answerId;
        let requestbody = req.body;
        let TokenDetail = req.user;

        const AnswerFound = await answerModel.findOne({ _id:answerId })
        if (!AnswerFound) {
            return res.status(404).send({ status: false, message: `  No answer found` })
        }
        if (AnswerFound.isDeleted == true) { // && AnswerFound.deletedAt == null 
            return res.status(400).send({ status: false, message: "Answer not exists" })
        }

        
        if (!validator.isValidRequestBody(requestbody)) {
            res.status(400).send({ status: false, message: 'please provide valid requestbody' });
            return
        }
        let { userId, questionId } = requestbody

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid userId` })
        }

        if (!validator.isValid(questionId)) {
            return res.status(400).send({ status: false, message: `questionId is required` })

        };


        const UserFound = await userModel.findOne({ _id:requestbody.userId })
        if (!UserFound) {
            return res.status(404).send({ status: false, message: ` No User found` })
        }

        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid questionId` })
        }


        answeredBy = requestbody.userId
        if (!(TokenDetail == requestbody.userId)) {
            return res.status(400).send({ status: false, message: "Userid are not mathched" })
        }
        let data = await answerModel.findOneAndUpdate({ answeredBy: userId },{ isDeleted: true, deletedAt: new Date()},{ new: true })//checkdb and refresh it set
        //console.log(data)
        
            return res.status(200).send({ status: true, message: `delete successfully`, data: data })
       
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.deleteAnswer = deleteAnswer