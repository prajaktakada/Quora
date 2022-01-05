const express = require('express')
const router = express.Router()


//Controller
const userController=require('../controllers/userController')
const questionController=require('../controllers/questionController')
const Middleware=require("../middleware/Authentication")
const answerController=require("../controllers/answerController")
//


//user
router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)
router.get('/user/:userId/profile',Middleware.Auth,userController.getUserDetails)
router.put('/user/:userId/profile',Middleware.Auth,userController.UpdateUser)

//question
router.post('/question',Middleware.Auth,questionController.createquestion)
router.get('/questions',questionController.getquestions)
router.get('/questions/:questionId',questionController.getQuestionById)
router.put('/questions/:questionId',Middleware.Auth,questionController.updatequestion)
router.delete('/questions/:questionId',Middleware.Auth,questionController.deleteQuestion)
//

//answer
router.post('/answer',Middleware.Auth,answerController.createanswer)
router.get('/questions/:questionId/answer',answerController.getanswerById)
router.put('/answer/:answerId',Middleware.Auth,answerController.updateAnswer)
router.delete('/answer',Middleware.Auth,answerController.deleteAnswer)


module.exports = router;