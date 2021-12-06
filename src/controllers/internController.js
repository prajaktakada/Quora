const InternModel = require('../models/internModel')
const CollegeModel = require('../models/collegeModel')

const regexMobile = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

//let interests = [];
//let aaa ;

// creating college

const createIntern = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide intern details' })
            return
        }

        //extract params

        const { name, email, mobile, collegeName } = requestBody;

        //validation starts

        if (!isValid(name)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid name' })
            return
        }

        if (!isValid(email)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid email' })
            return
        }
        if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({status: false, message: `Email should be a valid email address`})
            return
        }

        if (!isValid(mobile)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid mobile' })
            return
        }

        if(!(regexMobile.test(mobile))){
            res.status(400).send({status: false, message: `mobile should be valid `})
            return
        }


        if (!isValid(collegeName)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid collegeName' })
            return
        }

        const isNumberAlreadyUsed = await InternModel.findOne({mobile}); 

        if(isNumberAlreadyUsed) {
            res.status(400).send({status: false, message: `${mobile} mobile is already registered`})
            return
        }

        const isEmailAlreadyUsed = await InternModel.findOne({email}); 

        if(isEmailAlreadyUsed) {
            res.status(400).send({status: false, message: `${email} email is already registered`})
            return
        }

        //validation ends
         let nm = req.body.collegeName;
         //console.log(nm)
        const collegeData = await CollegeModel.findOne({name: nm })
        //console.log(collegeData)

        if(!collegeData){
            res.status(400).send({status: false, message: ` not a valid college name`})
        }

   
        let collegeId = collegeData._id;
        //console.log(collegeId)
        req.body.collegeId = collegeId;
       // console.log(req.body)

        const internData = {name, email, mobile,  collegeId }
        const createIntern = await InternModel.create(internData);

        res.status(201).send({ status: true, message: `college created successfully`, data: createIntern });

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });

    }
}

const getCollegeDetails = async function (req, res){
    try{
        let que = req.query;
        if(!isValidRequestBody(que)){
            res.status(400).send({status: false, msg: `Invalid request. No request passed in the query`})
            return
        }
        let collegeAbb = req.query.name;
        // if(!isValid(que)){
        //     res.status(400).send({ status: false, message: 'Invalid request parameters.  query not passed' })
        //     return
        // }
        let collegeDetail = await CollegeModel.findOne({name: collegeAbb})//.select({name: 1, fullName: 1, logoLink: 1})
        //console.log(collegeDetail)

        if(!isValid(collegeDetail)){
            res.status(400).send({ status: false, message: `Invalid request parameters. ${collegeAbb} is not a valid college name` })
            return
        }

        clgId = collegeDetail._id;
       // console.log(clgId)

         let internsData = await InternModel.find({collegeId: clgId}).select({_id: 1, name:1,email: 1, mobile: 1})
         if(internsData.length == 0){
            res.status(400).send({ status: false, message: ` No interns applied for this college` })
            return
         }
        // interests.push(internsData)
       // console.log(internsData)

        // for(let i = 0; i<internsData.length; i++){
        //     let obj = internsData[i];
        //     interests.push(obj)
        // }
        // console.log(interests)
        let newData = {
            name: collegeDetail.name, 
            fullName: collegeDetail.fullName, 
            logoLink: collegeDetail.logoLink,
            internsData: internsData 
        }
     // collegeDetail.name = aaa[name];

    //   
    //   let aaa.fullName = collegeDetail.fullName;
    //   let aaa.logoLink = collegeDetail.logoLink;
    //   let aaa.interests = internsData;
    //   console.log(aaa)

    // var result = Object.keys(collegeDetail).map((key) => [Number(key), collegeDetail[key]]);
    // console.log(result)
        res.status(200).send({ status: true, message: `college details with intern ` , data: newData })

    }catch(err){
        res.status(500).send({ status: false, message: err.message });
    }
}



module.exports.createIntern = createIntern;
module.exports.getCollegeDetails = getCollegeDetails 