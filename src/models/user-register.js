
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const res = require('express/lib/response');
const validator=require('validator')
const mongoosePaginate=require('mongoose-paginate-v2');
// const res = require('express/lib/response');

const userScheema= new mongoose.Schema({
    firstName : {
        type:String,
        // required:true
    },
    lastName : {
        type:String,
        // required:true
    },
    userName:{
        type:String,
        unique:true
    },
    email : {
        type:String,
        // required:true,
        unique:true
    },
    gender : {
        type:String,
        // required:true
    },
    touristPhone : {
        type:String,
        // required:true
    },
    touristAge : {
        type:Number,
        // required:true
    },
    password : {
        type:String,
        // required:true
    },
    cPassword : {
        type:String,
        // required:true
    },
    profilePicId:{
        type:String,
        default:"dummy-profile.webp"
    },
    country : {
        type:String,
        // required:true
    },
    address1 : {
        type:String,
        
    },
    address2 : {
        type:String,
        
    },
    pinCode : {
        type:String,
        
    },
    state : {
        type:String,
      
    },
    area : {
        type:String,
        
    },
    education : {
        type:String,
    },
    region : {
        type:String,     
    },
    bio : {
        type:String,
    },
    wishList:{
        type:Object
    },
    blockStatus:{
        type:Boolean
    },
    date:{
        type:Date,
        default:Date.now()
    },
    tokens : [{
        token:{
        type:String,
        // required:true
        }
    }]
})
userScheema.plugin(mongoosePaginate);
 //generating otp auth
 userScheema.methods.generateJWT=async function(){
     console.log('entered Generatejwt');
     const token=await jwt.sign({
         _id:this._id,
         touristPhone:this.touristPhone
     },process.env.SECRET_KEY,{expiresIn:"7d"})
     console.log(token);
    //  await this.save();
        return token;
 }

//generating tokens
userScheema.methods.generateAuthToken = async function(){
    try {
        console.log("entered to auth token");
        const token = await jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
       this.tokens = this.tokens.concat({token:token})
       console.log(token);
       await this.save();
        return token;
    } catch (error) {
        res.send("the error part"+error)
        console.log("the error part"+error)
    }
}

//converting password into hash
userScheema.pre("save",async function (next){
    if(this.isModified("password")){
        this.password =await bcrypt.hash(this.password, 10);
        this.cPassword=await bcrypt.hash(this.password, 10);
        // this.otp=await bcrypt.hash(this.otp, 10)
    }
   next();
})

//here we create collection
const User= new mongoose.model("User", userScheema);
module.exports = User;