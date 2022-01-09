const mongoose = require("mongoose")
const userModel = require('../models/userModel')
const validator = require("../util/validator")
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")


//POST /register
const createUser = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide college details' })
            return
        }

        //extract params

        let { fname, lname,phone,email,password,creditScore} = requestBody;

        //validation starts
        if (!validator.isValid(fname)) {
            res.status(400).send({ status: false, message: `fname is required` })
            return
        };
        if (!validator.isValid(lname)) {
            res.status(400).send({ status: false, message: `lname is required ` })
            return
        };
        if (!validator.isValid(phone)) {
            res.status(400).send({ status: false, message: 'phone no is required' })
            return
        };
        //phone = phone.trim()

        if (!(/^\(?([1-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone))) {
            res.status(400).send({ status: false, message: `Please fill a valid phone number` })
            return
        };

        const isPhoneAlreadyUsed = await userModel.findOne({ phone }); //{phone: phone} object shorthand property
        if (isPhoneAlreadyUsed) {
            res.status(400).send({ status: false, message: `${phone} phone number is already registered` })
            return
        };

        if (!validator.isValid(email)) {
            res.status(400).send({ status: false, message: `Email is required` })
            return
        };
        email = email.trim().toLowerCase()
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address ` })
            return
        };
        
        const isEmailAlreadyUsed = await userModel.findOne({ email }); // {email: email} object shorthand property
        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${email} email address is already registered` })
            return
        };

        if (!validator.isValid(password)) {
            res.status(400).send({ status: false, message: `Password is required` })
            return
        };

        if (!(password.length > 7 && password.length < 16)) {
            res.status(400).send({ status: false, message: "password should  between 8 and 15 characters" })
            return
        };


        // if (!validator.isValid(creditScore)) {
        //     res.status(400).send({ status: false, message: `creditScore is required` })
        //     return
        // };

        const userDetails = {fname, lname,phone,email,password,creditScore};
        const salt = await bcrypt.genSalt(10);
        userDetails.password = await bcrypt.hash(userDetails.password, salt)

        const newUser = await userModel.create(userDetails);
        res.status(201).send({ status: true, message: ` success`, data: newUser });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    };
}
       
//module.exports.createUser = createUser


//POST /login
const loginUser = async function (req, res) {
    try {

        if (!validator.isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, msg: "provide login credentials" })
        };
        
        let { email, password } = req.body
        if (!validator.isValid(email)) {
            return res.status(401).send({ status: false, msg: "Email is required" })
        };
        email = email.toLowerCase().trim()
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        };
        if (!validator.isValid(password)) {
            res.status(402).send({ status: false, msg: "password is required" })
            return
        };

        const user = await userModel.findOne({ email: req.body.email })
 
        if (!user) {
            res.status(403).send({ status: false, msg: "invalid email or password, try again with valid login credentials " })
            return
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
        res.status(200).send({ status: true, userId: user._id, token });
        return
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
        return
    };
};

//module.exports.loginUser = loginUser




//GET /user/:userId/profile 
const getUserDetails = async (req, res) => {
    try{
    userId = req.params.userId;
   // console.log(userId)
    TokenDetail =req.user
    //console.log(TokenDetail)

    if (!(TokenDetail === userId)) {
        res.status(403).send({ status: false, message: "userId in url param and in token is not same" })
    }

    if (!validator.isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: `${userId} is not a valid book id` })
    }

    if (!validator.isValid(userId)) {
        res.status(402).send({ status: false, msg: "userId is required" })
        return
    };

    const getUser = await userModel.findOne({ _id: userId})
    if (!getUser) {
        return res.status(404).send({ status: false, message: `No User found with given User Id` })
    }

    res.status(200).send({ status: true, "message": "User profile details", "data": getUser })
    }catch (err) {
        res.status(500).send({ status: false, msg: err.message })
        return
    };
};


//module.exports.getUserDetails = getUserDetails 

//PUT /user/:userId/profile 
const UpdateUser = async (req, res) => {
    try{

    userId = req.params.userId;
    const requestBody = req.body;
    TokenDetail = req.user

    if (!validator.isValidRequestBody(requestBody)) {
        return res.status(400).send({ status: false, message: 'No paramateres passed. Book unmodified' })
    }
    const UserFound = await userModel.findOne({ _id: userId })


    if (!UserFound) {
        return res.status(404).send({ status: false, message: `User not found with given UserId` })
    }
    if (!(TokenDetail === userId)) {
        res.status(400).send({ status: false, message: "userId in url param and in token is not same" })
    }

    let { fname, lname, email, phone} = requestBody

    if (!validator.isValid(fname)) {
        res.status(400).send({ status: false, message: `fname is required` })
        return
    };
    if (!validator.isValid(lname)) {
        res.status(400).send({ status: false, message: `lname is required ` })
        return
    };
    if (!validator.isValid(phone)) {
        res.status(400).send({ status: false, message: 'phone no is required' })
        return
    };
    //phone = phone.trim()

    if (!(/^\(?([1-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone))) {
        res.status(400).send({ status: false, message: `Please fill a valid phone number` })
        return
    };

    const isPhoneAlreadyUsed = await userModel.findOne({ phone }); //{phone: phone} object shorthand property
    if (isPhoneAlreadyUsed) {
        res.status(400).send({ status: false, message: `${phone} phone number is already registered` })
        return
    };


    if (!validator.isValid(email)) {
        return res.status(401).send({ status: false, msg: "Email is required" })
    };
    email = email.toLowerCase().trim()
    if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
        res.status(400).send({ status: false, message: `Email should be a valid email address` })
        return
    };
    const isEmailAlreadyUsed = await userModel.findOne({ email }); // {email: email} object shorthand property
    if (isEmailAlreadyUsed) {
        res.status(400).send({ status: false, message: `${email} email address is already registered` })
        return
    };

    requestBody.UpdatedAt = new Date()
    const UpdateData = { fname,lname, email, phone}
    const upatedUser = await userModel.findOneAndUpdate({ _id: userId }, UpdateData, { new: true })
    res.status(200).send({ status: true, message: 'User updated successfully', data: upatedUser });
    }catch(err)
    {
        return res.status(500).send({status:false,message:err.message})
    }
}


//module.exports.UpdateUser=UpdateUser
module.exports = { createUser,loginUser,getUserDetails,UpdateUser }