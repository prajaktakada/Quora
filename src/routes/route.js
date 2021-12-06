const express = require('express')

const router = express.Router()

const CollegeController = require('../controllers/collegeController')
const internController = require('../controllers/internController')


router.post("/colleges", CollegeController.createCollege)
router.post("/interns", internController.createIntern)
router.get("/collegeDetails", internController.getCollegeDetails)

module.exports = router;