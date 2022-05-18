const jwt = require('jsonwebtoken');
const Member=require('../models/member-register');


const auth=async(req,res,next)=>{
    try {
        const token=req.cookies.memberLoginJwt;
        const adminToken=req.cookies.adminToken;
      if(token){
        const verifyMember=  jwt.verify(token,process.env.SECRET_KEY);
        const member = await Member.findOne({_id:verifyMember._id});
        req.token=token;
        req.user=member;
        next();
      }else if(adminToken){
        const verifyMember =jwt.verify(adminToken, process.env.SECRET_KEY);
        const admin={
            name:"Admin"
        }
        req.token = token;
        req.user= admin;
        req.admin=true;
        next();
      } else{
        req.login=false;
        next()
    }

    } catch (error) {
        res.status(401).send(error)
    }
}
module.exports=auth


