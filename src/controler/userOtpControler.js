const bcrypt=require('bcryptjs');
const _ =require('lodash');
const axios=require('axios');
const otpGenerator=require('otp-generator');
const Otp=require('../models/otpModel')
const User=require('../models/user-register');


module.exports.mobile=(req,res)=>{
    res.render('users/mobile')
}


module.exports.numberPost=async(req,res)=>{

    const OTP=otpGenerator.generate(6,{
        digits:true,
        lowerCaseAlphabets:false,
        upperCaseAlphabets:false,
        specialChars:false
    });
 const number=req.body.number;
 console.log(OTP);

    
        // const number=req.body.number;
        // console.log(number);
        // req.session.mobile=number;
        // client.verify
        // .services(servideSID)
        // .verifications.create({
        //     to:`+91 ${number}`,
        //     channel:"SMS"
        // }).then((resp)=>{
        //     console.log("response"+resp);
        //     console.log("message send");
        //     res.render('users/otp')
        // }).catch(e=>{console.log(e);})
        
        
}
// module.exports.verify=async(req,res)=>{


    // try {
    //     const otp=req.body.otp;
    //     client.verify
    //     .services(servideSID)
    //     .verificationChecks.create({
    //          to:`+91${req.session.mobile}`,
    //          code:otp
    //     })
    //     res.send("success")

    // } catch (error) {
    //     console.log(error);
    // }
 
// }
