const Member = require('../../src/models/member-register');
const bcrypt=require('bcryptjs');
const jwt = require('jsonwebtoken');
const {check,validationResult}=require('express-validator')
//members home router<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// exports.home=(req, res)=>{
    
//   }
//member signup route : localhost:3000/loginMain, method POST
exports.signupGuidePost=async(req,res)=>{
    try {
      console.log(req.body);
      const password =req.body.password;
      const cPassword =req.body.cPassword;
      if(password===cPassword){
        const registerMember = new Member({
          firstName:req.body.firstName,
          lastName:req.body.lastName,
          userName:req.body.userName,
          email:req.body.email,
          gender:req.body.gender,  
          memberPhone:req.body.memberPhone,
          memberAge:req.body.memberAge,
          password:req.body.password,
          cPassword:req.body.cPassword,
          position:req.body.position,
          idType:req.body.idType,
          country:req.body.country,
          place:req.body.place
        });
       const token =await registerMember.generateAuthTokenMember();
       //adding cookie at member browser
        res.cookie('memberLoginJwt', token,{httpOnly:true});
       const register = await registerMember.save();
       res.render('members/thankYou',{thankYou:true});
      }else{  
        res.status(400).render('users/login-main',{loginmain:true,message:'Invalid credentials, Please check your Email and password again'})
      }
    } catch (error) {
      res.status(400).render('users/login-main',{loginmain:true,message:'Invalid credentials, Please check your Email and password again'})
    }
}
//login page for guides/member :localhost:3000/loginMain method POST
exports.loginGuidePost=async(req,res)=>{ 
    try {
      const email = req.body.email;
      const password = req.body.password;
      const errors=validationResult(req)
      if(!errors.isEmpty()){
        const alert=errors.array()
        res.render('users/login-main',{alert,loginmain:true})
      }else{
        const memberEmail = await Member.findOne({email:email});
        const isPasswordMatch = await bcrypt.compare(password,memberEmail.password);
        //generating member token part
        const token =await memberEmail.generateAuthTokenMember();
        //adding generated token in member browser
        res.cookie('memberLoginJwt', token,{httpOnly:true});
        if(isPasswordMatch){
          res.redirect('/members/dashboard')
        }
      }
    } catch (error) {
      res.status(400).render('users/login-main',{loginmain:true,message:'Invalid credentials, Please check your Email and password again'})
    }
  }
  //
exports.logout=async (req,res)=>{
    try {
      //for single device
      // req.member.tokens=req.member.tokens.filter((elem)=>{
      //   return elem.token!==req.token
      // })
      //for all devices
      req.user.tokens = [];
      res.clearCookie('memberLoginJwt')
      console.log("logout success from member");
      await req.user.save()
      res.redirect('/')
    } catch (error) {
      res.status(500).send(error)
    }
  }
