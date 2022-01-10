
const userModel = require('../models/userModel')
const validator = require("../util/validator")
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")


//POST /register
const createUser = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide college details' })

        }

        //extract params
        let { fname, lname, phone, email, password, creditScore } = requestBody;

        //validation starts
        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: `fname is required` })

        };
        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: `lname is required ` })

        };

        if (!validator.isValid(phone)) {
            if (!(/^\(?([1-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone)))
                return res.status(400).send({ status: false, message: 'phone no is required' })

        };

        const isPhoneAlreadyUsed = await userModel.findOne({ phone }); //{phone: phone} object shorthand property
        if (isPhoneAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${phone} phone number is already registered` })

        };

        email = email.trim().toLowerCase()
        if (!validator.isValid(email)) {
            if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)))
                return res.status(400).send({ status: false, message: `Email is required` })

        };

        const isEmailAlreadyUsed = await userModel.findOne({ email:emaul}); 
        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${email} email address is already registered` })

        };

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: `Password is required` })

        };

        if (!(password.length > 7 && password.length < 16)) {
            return res.status(400).send({ status: false, message: "password should  between 8 and 15 characters" })

        };

        const userDetails = { fname, lname, phone, email, password, creditScore };
        const salt = await bcrypt.genSalt(10);
        userDetails.password = await bcrypt.hash(userDetails.password, salt)

        const newUser = await userModel.create(userDetails);
        res.status(201).send({ status: true, message: ` success`, data: newUser });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    };
}




//POST /login
const loginUser = async function (req, res) {
    try {

        if (!validator.isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, msg: "provide login credentials" })
        };

        let { email, password } = req.body

        email = email.toLowerCase().trim()
        if (!validator.isValid(email)) {
            if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)))
                return res.status(401).send({ status: false, msg: "Email is required" })
        };

        if (!validator.isValid(password)) {
            return res.status(402).send({ status: false, msg: "password is required" })

        };

        const user = await userModel.findOne({ email: req.body.email })

        if (!user) {
            return res.status(403).send({ status: false, msg: "invalid email or password, try again with valid login credentials " })

        };

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).send({ msg: "Invalid credential" })
        }

        const token = await jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),//issue date
            exp: Math.floor(Date.now() / 1000) + 3000 * 60//expire date 30*60 = 30min 
        }, 'pkproject6');
        res.header('x-api-key', token);
        return res.status(200).send({ status: true, userId: user._id, token });

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })

    };
};



//GET /user/:userId/profile 
const getUserDetails = async (req, res) => {
    try {
        userId = req.params.userId;
        TokenDetail = req.user

        if (!(TokenDetail === userId)) {
            return res.status(401).send({ status: false, message: "userId in url param and in token is not same" })
        }

        if (!((validator.isValidObjectId(userId)) && (!validator.isValid(userId)))) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid book id` })
        }


        const getUser = await userModel.findOne({ _id: userId })
        if (!getUser) {
            return res.status(400).send({ status: false, message: `No User found with given User Id` })
        }

        res.status(200).send({ status: true, data: getUser })
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    };
};




//PUT /user/:userId/profile 
const UpdateUser = async (req, res) => {
    try {

        userId = req.params.userId;
        const requestBody = req.body;
        TokenDetail = req.user

        if (!(TokenDetail === userId)) {
            return res.status(400).send({ status: false, message: "userId in url param and in token is not same" })
        }
        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'No paramateres passed. Book unmodified' })
        }
        const UserFound = await userModel.findOne({ _id: userId })

        if (!UserFound) {
            return res.status(404).send({ status: false, message: `User not found with given UserId` })
        }

        let { fname, lname, email, phone } = requestBody

        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: `fname is required` })

        };
        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: `lname is required ` })

        };
        if (!validator.isValid(phone)) {
            if (!(/^\(?([1-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone)))
                return res.status(400).send({ status: false, message: 'phone is required' })

        };

        const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone });
        if (isPhoneAlreadyUsed) {
            res.status(400).send({ status: false, message: `${phone} phone number is already registered` })
            return
        };
        email = email.toLowerCase().trim()
        if (!validator.isValid(email)) {
            if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)))
                return res.status(401).send({ status: false, msg: "Email is required" })
        };

        const isEmailAlreadyUsed = await userModel.findOne({ email: email });
        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${email} email address is already registered` })
            return
        };

        requestBody.UpdatedAt = new Date()
        const UpdateData = { fname, lname, email, phone }
        const upatedUser = await userModel.findOneAndUpdate({ _id: userId }, UpdateData, { new: true })
        res.status(200).send({ status: true, message: 'User updated', data: upatedUser });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { createUser, loginUser, getUserDetails, UpdateUser }