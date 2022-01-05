//questionController
const mongoose = require("mongoose")
const userModel = require('../models/userModel')
const validator = require("../util/validator")
const questionModel = require('../models/questionModel')
const answerModel = require('../models/answerModel')



//POST /question
const createquestion = async function (req, res) {
    try {
        const requestBody = req.body;
        TokenDetail = req.user

        if (!(TokenDetail === requestBody.userId)) {
            res.status(401).send({ status: false, message: "userId  and in token is not same" })
        }

        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Please provide requestBody details' })
            return
        }

        //extract params

        let { description, tag, askedBy } = requestBody

        //validation starts

        if (!validator.isValid(description)) {
            res.status(400).send({ status: false, message: `description is required` })
            return
        };

        if (!validator.isValid(tag)) {
            res.status(400).send({ status: false, message: `tag is required` })
            return
        };

        //validation ends

        askedBy = requestBody.userId
        if (!(validator.isValidObjectId(requestBody.userId))) {
            return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        }
        if (!validator.isValid(requestBody.userId)) {
            return res.status(401).send({ status: false, msg: "userId is required" })
        };


        const questionData = { description, tag, askedBy: askedBy }
        const questions = await questionModel.create(questionData);

        res.status(201).send(questions);

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });

    }
}

module.exports.createquestion = createquestion


//GET /questions 
const getquestions = async function (req, res) {
    try {
        let filterQuery = { isDeleted: false }
        let querybody = req.query;


        // if (!validator.isValidRequestBody(querybody)) {
        //     let NDeleted = await questionModel.find(filterQuery) //.sort({ price: -1 })
        //     res.status(200).send({ status: true, message: 'Not Deleted questions are', data: NDeleted })
        //     return
        // };

        var { tag, sort } = querybody

        if (validator.isValid(tag)) {
            filterQuery['tag'] = tag
        };


        if (sort) {
            sort = sort.toLowerCase()
            if (sort == "descending") {
                sort = -1
            }
            if (sort == "ascending") {
                sort = 1
            }
        }

        var filterData = await questionModel.find(filterQuery).sort({ "createdAt": sort }).lean()

        for (let i = 0; i < filterData.length; i++) {
            console.log(filterData[i])
            let answer = await answerModel.find({ questionId: filterData[i]._id }).select({ text: 1, answeredBy: 1})
            console.log(answer)
            filterData[i].answers = answer
        }

        // if (filterData == 0) {
        //     return res.status(400).send({ status: false, msg: "no questions found " })
        // }

 return res.status(200).send({ status: true, msg: "questions", Details:filterData })
    }

    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
};

module.exports.getquestions = getquestions


//GET /questions/:questionId 
const getQuestionById = async (req, res) => {
    try {
        const questionId = req.params.questionId;
        console.log(questionId)
        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid questionId id` })
        }

        let question = await questionModel.findById({ _id: questionId, isDeleted: false });
        console.log(question)

        if (!question) {
            return res.status(404).send({ status: false, message: `question does not exit` })
        }

//question with answer
       let answer = await answerModel.find({ questionId: questionId }).select({ text: 1, answeredBy: 1 })
        question.answers=answer;

        var newdata={
            //name: collegeDetail.name, 
            description:question.description,
            tag:question.tag,
            askedBy:question.askedBy,
            isDeleted:question.isDeleted,
            answer:answer
        
        
        }

        return res.status(200).send({ status: true, message: 'Success', data: newdata })

        //return res.status(200).send({ status: true, message: 'Success', data: question })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

module.exports.getQuestionById = getQuestionById




//PUT /questions/:questionId 
const updatequestion = async (req, res) => {
    try {
        questionId = req.params.questionId;
        const requestBody = req.body;
        TokenDetail = req.user

        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid questionId` })
        }


        const questionFound = await questionModel.findOne({ _id: questionId })
        if (!questionFound) {
            return res.status(404).send({ status: false, message: `question Details not found with given qutionid` })
        }


        if (!(TokenDetail == questionFound.askedBy)) {
            res.status(401).send({ status: false, message: "userId in url param and in token is not same" })
        }


        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'please provide request body' })
        }


        let { tag, description} = requestBody

        if (!validator.isValid(tag)) {
            return res.status(400).send({ status: false, message: `tag not provide` })
        }

        
        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: `description not provide` })
        }

        //Validation Ends

        
        const UpdateData = { description, tag }
        UpdateData.updatedAt = new Date()
        const upatedUser = await questionModel.findOneAndUpdate({ _id: questionId }, UpdateData, { new: true })
        res.status(200).send({ status: true, message: 'question updated successfully', data: upatedUser });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
}

module.exports.updatequestion = updatequestion


//DELETE /questions/:questionId
const deleteQuestion = async (req, res) => {
    try {

        questionId = req.params.questionId;
        TokenDetail = req.user

        const questionFound = await questionModel.findOne({ _id: questionId })
        //console.log(questionFound.askedBy)
        if (!questionFound) {
            return res.status(404).send({ status: false, message: `questionFound Details not found with` })
        }

        if (!validator.isValidObjectId(questionId)) {
            return res.status(400).send({ status: false, message: `${questionId} is not a valid questionId` })
        }

        // console.log(TokenDetail)
        // console.log(questionFound.askedBy)
        if (!(TokenDetail == questionFound.askedBy)) {
            res.status(401).send({ status: false, message: "userId  and in token is not same" })
        }


        if (questionFound.isDeleted == true) {
            return res.status(404).send({ status: false, message: "This questionFound already deleted" });
        }
        await questionModel.findOneAndUpdate({ _id: questionId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        res.status(200).send({ status: true, message: `question deleted successfully` })
    }
    catch (err) {
        return res.status(500).send({ message: err.message });
    }
}

module.exports.deleteQuestion = deleteQuestion


