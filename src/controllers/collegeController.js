const CollegeModel = require('../models/collegeModel')

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

// creating college

const createCollege = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide college details' })
            return
        }

        //extract params

        const { name, fullName, logoLink } = requestBody;

        //validation starts

        if (!isValid(name)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid name' })
            return
        }

        if (!isValid(fullName)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid fullName' })
            return
        }
        if (!isValid(logoLink)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid logoLink' })
            return
        }

        const isNameAlreadyUsed = await CollegeModel.findOne({name}); 

        if(isNameAlreadyUsed) {
            res.status(400).send({status: false, message: `${name} name is already registered`})
            return
        }

        //validation ends

        const collegeData = { name, fullName, logoLink } 
        const createCollege = await CollegeModel.create(collegeData);

        res.status(201).send({ status: true, message: `college created successfully`, data: createCollege });

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });

    }
}



module.exports.createCollege = createCollege;
//module.exports.createCollege = createCollege;
