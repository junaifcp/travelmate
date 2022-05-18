// require('../src/db/conn');
const User=require('../../src/models/user-register');
const Member=require('../../src/models/member-register');
const bcrypt=require('bcryptjs');
// const auth = require('../src/middleware/userAuth');
const memberHelper=require('../../src/controler/member-functions')
const otpGenerator=require('otp-generator');
const { Otp } = require('../models/otpModel');
const _ =require('lodash');
const fast2sms = require('fast-two-sms')
const mongoose=require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { ObjectId } = require('mongodb');
const Contact=require('../../src/models/contact-register')
const axios = require("axios");
const Post=require('../models/post');
const Category = require('../models/category');
const jwt = require('jsonwebtoken')
const nodemailer=require('nodemailer')
const xoauth2 = require('xoauth2');
var validator = require("email-validator");
const { response } = require('../../app');
const destCategory = require('../models/destCategory');
const Destination=require('../../src/models/destination')
const {check,validationResult}=require('express-validator')
//Home route starts here
exports.home=async (req,res)=>{
    const posts=await Post.find().sort({createdAt:-1}).limit(6).lean()
    const types=await destCategory.find().lean()
    memberHelper.getAllMembers().then((members)=>{
      if(req.cookies.jwt){
        let users=req.user.toJSON();
        res.render('index',{users,client:true,members,posts,homeMain:true,types});
      }else if(req.cookies.memberLoginJwt){
        let users=req.user.toJSON();
        res.render('index',{users,member:true,members,posts,homeMain:true,types});
      }else{
        res.render('index',{client:true,members,posts,homeMain:true,types});
      } 
    })
}
exports.showAllMembers=async(req,res)=>{
  const limit=parseInt(req.query.limit,10)||6;
  const page=parseInt(req.query.page,10)||1;
  try {
      if(req.cookies.jwt){
        let users=req.user.toJSON();
        let members= await Member.paginate({},{limit,page,lean:true});
        const pageTotal=members.totalPages
        res.render('users/user-list',{users,client:true,members,pageTotal});
      }else if(req.cookies.memberLoginJwt){
        
        let users=req.user.toJSON();
        let members= await Member.paginate({},{limit,page,lean:true});
        const pageTotal=members.totalPages
        res.render('users/user-list',{users,member:true,members,pageTotal}); 
      }else{
        let members= await Member.paginate({},{limit,page,lean:true});
        const pageTotal=members.totalPages
        res.render('users/user-list',{client:true,members,pageTotal});
      } 
  } catch (error) {
    console.log(error+"message");
  }
}
exports.showAllMembersPost=async(req,res)=>{
  const limit=parseInt(req.query.limit,10)||6;
  const page=parseInt(req.query.page,10)||1;
  try {
      if(req.cookies.jwt){
        let users=req.user.toJSON();
        let members= await Member.paginate({place:"Munnar"},{limit,page,lean:true});
        const pageTotal=members.totalPages;
        res.render('users/user-list',{users,client:true,members,pageTotal});
      }else if(req.cookies.memberLoginJwt){
        
        let users=req.user.toJSON();
        let members= await Member.paginate({},{limit,page,lean:true});
        const pageTotal=members.totalPages
        res.render('users/user-list',{users,member:true,members,pageTotal}); 
      }else{
        let members= await Member.paginate({},{limit,page,lean:true});
        const pageTotal=members.totalPages
        res.render('users/user-list',{client:true,members,pageTotal});
      } 
  } catch (error) {
    console.log(error+"message");
  }
}
//login main page route here<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
exports.loginMain=(req,res)=>{
  if(req.cookies.jwt){
    res.redirect('/')
  }else if(req.cookies.memberLoginJwt){
    res.redirect('/')
  }else{
    res.render('users/login-main',{loginmain:true}); 
  } 
}
//login for user, in the same page login-main
//user signup form POST Method<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
exports.loginPost=async(req,res)=>{
    try {
        const email=req.body.username;
        const password=req.body.password;
       const userEmail =await User.findOne({email:email});
       const isPasswordMatch =await bcrypt.compare(password,userEmail.password);
       const token =await userEmail.generateAuthToken();
       //store the created token in user browser before login
       res.cookie("jwt", token,{
        httpOnly:true
      });  
       if(isPasswordMatch){
         res.redirect('/dashboard')
       }else{
        res.render('users/login-main',{loginmain:true,message:'Something went wrong check your email and password'});
       }
      } catch (error) {
        res.render('users/login-main',{loginmain:true,message:'Email is not valid'});
      }
}
exports.signupPost=(req,res)=>{
  res.render('users/user-signup',{loginmain:true});
}
//user signup POST section router {method POST}<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
exports.signupUser=async(req,res)=>{
    try {
      const password=req.body.password;
      const cPassword=req.body.cPassword;
      if(password===cPassword){
         const userList = new User({
           firstName : req.body.firstName,
           lastName : req.body.lastName,
           userName:req.body.userName, 
           email : req.body.email,
           gender : req.body.gender,
           touristPhone : req.body.touristPhone,
           touristAge : req.body.touristAge,
           password : req.body.password,
           cPassword : req.body.cPassword,
         });
         const OTP=otpGenerator.generate(6,{
          digits:true,
          lowerCaseAlphabets:false,
          upperCaseAlphabets:false,
          specialChars:false
         })
         const number=req.body.touristPhone;
         req.session.number=req.body.touristPhone;
         console.log(OTP);
        
        //  var options = {authorization : 'bDfhyk2JsVuMAN9XSpxi6nLvKd0wztZaeUrFCQ3BR15lTPg7qjX9Niwx1y3VMRS0PKHnZU6LutrGQmvW' , message : `Otp for login to My tour mate is ${OTP}` ,  numbers : [`${number}`]} 
        //  fast2sms.sendMessage(options);

         const otp=new Otp({number:number,otp:OTP});
         const salt=await bcrypt.genSalt(10);
         otp.otp=await bcrypt.hash(otp.otp,salt);
         const result=await otp.save();
         console.log(result+" the result");
         const token =await userList.generateAuthToken();
        //  console.log(token);
        //store cookies while signup in user browser
         res.cookie("jwt", token,{
           httpOnly:true
         });
         res.status(201).render('users/thankYou',{thankYou:true});
      }else{
        res.render('users/user-signup',{message:"passwords are not matching",loginmain:true})
      }
    } catch (error) {
      res.render('users/user-signup',{loginmain:true,message:"All the fields are required... Please fill up the form properly"})
    }  
  }

  //verify otp
  module.exports.verify=async(req,res)=>{
    try {
      console.log(req.session.number);
    console.log(req.body);
    console.log("hi every");
    const otpHolder=await Otp.find({
      number:req.session.number
    })
    if(otpHolder.length===0) return res.render('users/thankYou',{message:"You are using an expired OTP"})
    const rightOtpFind=otpHolder[otpHolder.length-1]
    console.log("right otp find"+rightOtpFind);
    const validUser=await bcrypt.compare(req.body.otp,rightOtpFind.otp);
    console.log(validUser);
    if(rightOtpFind.number===req.session.number&&validUser){
      console.log(req.body);
      const user=new User(_.pick(req.body,["touristPhone"]));
      console.log(user);
      const token=await user.generateJWT();
      console.log(token+"   token");
      //store cookies after enter otp in user browser
      res.cookie("jwtOtp", token,{
        httpOnly:true
      });
      console.log(token);
      // const result=await user.save();
      const OTPDelete=await Otp.deleteMany({
        number:rightOtpFind.number
      })
      return res.redirect('/');
    }else{
      return res.status(400).send("your otp was wrong")
    }
    } catch (error) {
      console.log(error+" the errorr");
    }
    
  }
  //logout user from divice where logged In<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
   exports.logout=async(req,res)=>{
    try {
      if(req.cookies.jwt){
      // for single divice logout
      req.user.tokens = req.user.tokens.filter((currentElement)=>{
        return currentElement.token !== req.token
      });
      //logout from all the devices use the code below instead of singlw logout
      // req.user.tokens = [];
      res.clearCookie('jwt');
      console.log("logout success from user");
      await req.user.save();
      res.redirect('/')
    }else if(req.cookies.memberLoginJwt){
      // for single divice logout
    req.user.tokens = req.user.tokens.filter((currentElement)=>{
      return currentElement.token !== req.token
    });
    //logout from all the devices use the code below instead of singlw logout
    // req.user.tokens = [];
    res.clearCookie('memberLoginJwt');
    console.log("logout successful from member");
    await req.user.save();
    res.redirect('/')
    }
    } catch (error) {
      if(req.login==false){
          res.redirect('/')
      }else{
        res.status(500).alert("Something went wrong while logout.... Please try again");
      }  
    }
  }

  //user dashboard section
  exports.dashboard=async(req,res)=>{
    const users=req.user.toJSON();
    const _id=users._id;
    if(users.wishList){
      const wishArray=users.wishList;
    console.log(users.wishList);
    const wishList=wishArray.map(function(element){
      return element.destination
    })
    const members=await Member.find({destination:{$in:wishList}}).lean()
    console.log(members+"thisss");
    res.render('users/dashboard',{memberStyle:true,users,members})
    }else{
      res.render('users/dashboard',{memberStyle:true,users})
    }
    
  }
  exports.editPic=async(req,res)=>{
    let user=req.user.toJSON()
    res.render('users/edit-user-pic',{user})
  }
  exports.uploadPic=async(req,res)=>{
    const files=req.files;
    if(!files){
      const error=new Error('Please choose files')
      error.httpStatusCode=400;
      return next(error)
    }
    const imgName=files[0].filename
    const _id=mongoose.Types.ObjectId(req.params.id);
    const user = await User.updateOne({_id:_id},{
      $set:{
          profilePicId:imgName
      }
  },{upsert:true});
    res.redirect('/dashboard')

  }
  exports.editProfile=(req,res)=>{
    const user=req.user.toJSON();
    res.render('users/edit-profile',{memberStyle:true,user})
  }
  exports.editProfilePost=async(req,res)=>{
    const user=req.user.toJSON()
    const updations=req.body;
    const _id=user._id;
    const update = await User.updateOne({_id:_id},{
      $set:{
          firstName:updations.firstName,
          lastName:updations.lastName,
          email:updations.email,
          touristPhone:updations.memberPhone,
          country:updations.country,
          address1:updations.address1,
          address2:updations.address2,
          pinCode:updations.pinCode,
          state:updations.state,
          area:updations.area,
          education:updations.education,
          region:updations.region,
          bio:updations.bio
      }
  },{upsert:true});
     console.log(req.body);
     res.redirect('/dashboard')
  }
  exports.addWishlist=async(req,res)=>{
    const users=req.user.toJSON();
    const _id=users._id;
    const wishList=req.body;
    const date1=new Date(wishList.checkInDate);
    const date2=new Date(wishList.checkOutDate);
    // To calculate the time difference of two dates
     const Difference_In_Time = date2.getTime() - date1.getTime();
     // To calculate the no. of days between two dates
     const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
     const wishArray={
        destination:wishList.destination,
        checkInDate:wishList.checkInDate,
        checkOutDate:wishList.checkOutDate,
        days:Difference_In_Days,
        _id:new ObjectId(),
        date:Date.now()
     }
     const updateWishList=await User.updateOne({_id},{
       $push:{
          wishList:wishArray
       }
     })
    res.redirect('/dashboard')   
  }
  exports.deleteWish=async(req,res)=>{
    try {
      const _id=mongoose.Types.ObjectId(req.params.id);
      // console.log(date);
      const users=req.user.toJSON();
      // console.log(users);
      const user=await User.updateOne({_id:users._id},{
        $pull:{
          wishList:{
            _id:_id
          }
        }
      })
     
      console.log(user);
      res.redirect('/dashboard')
    } catch (error) {
      console.log(error);
    }
  }
  exports.findGuide=async (req,res)=>{
    const users=req.user.toJSON()
    const _id=users._id;
    const wishArray=users.wishList;
    console.log(users.wishList);
    const wishList=wishArray.map(function(element){
      return element.destination
    })
    const members=await Member.find({destination:{$in:wishList}}).lean()
    // console.log(member);
    res.redirect('/dashboard')
    // console.log(member)
  }
  exports.about=(req,res)=>{
    let user=req.cookies.jwt;
    let guide=req.cookies.memberLoginJwt;
    if(user){
      let users=req.user.toJSON();
      res.render('landing/about',{client:true,users})
    }else if(guide){
      let users=req.user.toJSON();
      res.render('landing/about',{member:true,users})
    }else{
      res.render('landing/about',{client:true});
    }  
  }
  exports.destination=async(req,res)=>{
    let user=req.cookies.jwt;
    let guide=req.cookies.memberLoginJwt;
    const catName=await destCategory.find().lean()
    if(user){
      let users=req.user.toJSON();
      res.render('landing/destination',{client:true,users,blogLat:true,catName})
    }else if(guide){
      let users=req.user.toJSON();
      res.render('landing/destination',{member:true,users,blogLat:true,catName})
    }else{
      res.render('landing/destination',{client:true,blogLat:true,catName});
    } 
  }
  exports.destinationSingle=async(req,res)=>{
    let user=req.cookies.jwt;
    let guide=req.cookies.memberLoginJwt;
    const categories=await destCategory.find().lean();
    const recent=await Post.find().limit(5).lean()
    const cat=req.params.id
    const catList=await Destination.find({categories:[cat]}).sort({createdAt:-1}).lean();
    // console.log(catList);
    // console.log(catList);
    if(user){
      let users=req.user.toJSON();
      res.render('landing/destination-single',{client:true,users,catList,categories,recent,types:true});
    }else if(guide){
      let users=req.user.toJSON();
      res.render('landing/destination-single',{member:true,users,catList,categories,recent,types:true});
    }else{
      res.render('landing/destination-single',{client:true,catList,categories,recent,types:true});
    } 
  }
  exports.destinationFull=async(req,res)=>{
    let user=req.cookies.jwt;
    let guide=req.cookies.memberLoginJwt;
    const categories=await destCategory.find().lean();
    const recent=await Post.find().limit(5).lean()
    const _id=req.params.id
    const destination=await Destination.find({_id}).sort({createdAt:-1}).lean();
  
    // console.log(catList);
    if(user){
      let users=req.user.toJSON();
      res.render('landing/destination-full',{client:true,users,destination,categories,recent,single:true,hotelSingle:true});
    }else if(guide){
      let users=req.user.toJSON();
      res.render('landing/destination-full',{member:true,users,destination,categories,recent,single:true,hotelSingle:true});
    }else{
      res.render('landing/destination-full',{client:true,destination,categories,recent,single:true,hotelSingle:true});
    } 
  }
  exports.hotel=(req,res)=>{
    let user=req.cookies.jwt;
    let guide=req.cookies.memberLoginJwt;

    if(user){
      let users=req.user.toJSON();
      res.render('landing/hotel',{client:true,users,booking:true})
    }else if(guide){
      let users=req.user.toJSON();
      res.render('landing/hotel',{member:true,users,booking:true})
    }else{
      res.render('landing/hotel',{client:true,booking:true});
    } 
  }
  exports.blog= async(req,res)=>{
    let user=req.cookies.jwt;
    let guide=req.cookies.memberLoginJwt;
    const limit=parseInt(req.query.limit,10)||6;
    const page=parseInt(req.query.page,10)||1;
    let postsPage= await Post.paginate({},{limit,page,sort:{createdAt:-1},lean:true})
    console.log(postsPage);
  
    const pageTotal=postsPage.totalPages
    let posts;
    const username=req.query.user;
    const catName=req.query.cat;
    const latest=await Post.find().sort({createdAt:-1}).limit(5).lean()
    try {
      
      if(username){
          posts=await Post.find({username:username}).sort({createdAt:-1}).limit(6).lean()
          res.render('landing/blog',{client:true,posts,latest,blogLat:true})
      }else if(catName){
          posts=await Post.find({categories:{
              $in:[catName]
          }}).sort({createdAt:-1}).limit(6).lean()
          res.render('landing/blog',{client:true,posts,latest,blogLat:true})

      }else{
          posts= await Post.find().sort({createdAt:-1}).limit(6).lean()
      }
      if(user){
        let users=req.user.toJSON();
        res.render('landing/blog',{client:true,users,latest,postsPage,pageTotal,blogLat:true})
      }else if(guide){
        let users=req.user.toJSON();
        res.render('landing/blog',{member:true,users,latest,postsPage,pageTotal,blogLat:true})
      }else{
        res.render('landing/blog',{client:true,latest,postsPage,pageTotal,blogLat:true});
      } 
    } catch (error) {
      console.log(error);
    }
  }
  exports.contact=(req,res)=>{
    let user=req.cookies.jwt;
    let guide=req.cookies.memberLoginJwt;
    if(user){
      let users=req.user.toJSON();
      res.render('landing/contact',{client:true,users})
    }else if(guide){
      let users=req.user.toJSON();
      res.render('landing/contact',{member:true,users})
    }else{
      res.render('landing/contact',{client:true});
    } 
  }

  exports.blogSingle=async(req,res)=>{
    try {
      const _id=mongoose.Types.ObjectId(req.params.id);
      const category=await Category.find().lean()
      const post=await Post.findOne({_id}).lean();
      const recent=await Post.find().limit(5).lean()
      const author=await Member.findOne({userName:post.username}).lean();
      let user=req.cookies.jwt;
      let guide=req.cookies.memberLoginJwt;
      if(user){
        let users=req.user.toJSON();
        res.render('landing/blog-single',{post,author,client:true,category,recent,users})
        
      }else if(guide){
        let users=req.user.toJSON();
        res.render('landing/blog-single',{post,author,member:true,category,recent,users})
      }else{
        res.render('landing/blog-single',{post,author,client:true,category,recent})
      } 
    } catch (error) {
      console.log(error);
    }
  }
  exports.contactPost=async(req,res)=>{
    // res.json(req.body)
  
    try {
      const errors=validationResult(req)
      let user=req.cookies.jwt;
      let guide=req.cookies.memberLoginJwt;
      if(!errors.isEmpty()){
        const alert=errors.array()
        if(user){
          let users=req.user.toJSON();
          res.render('landing/contact',{client:true,users,alert})
        }else if(guide){
          let users=req.user.toJSON();
          res.render('landing/contact',{member:true,users,alert})
        }else{
          res.render('landing/contact',{client:true,alert});
        } 
      }else{
        const contact=req.body;
        const contactList=new Contact({
          name:contact.name,
          email:contact.email,
          subject:contact.subject,
          message:contact.message
        })
        const register=await contactList.save();
        const message="Message recieved successfully"
        if(user){
          let users=req.user.toJSON();
          res.render('landing/contact',{client:true,users,message})
        }else if(guide){
          let users=req.user.toJSON();
          res.render('landing/contact',{member:true,users,message})
        }else{
          res.render('landing/contact',{client:true,message});
        } 
      }
    } catch (error) {
      console.log(error);
    }

    
  }
  exports.destinationPost=async(req,res)=>{
    try {
      let user=req.cookies.jwt;
      let guide=req.cookies.memberLoginJwt;
      let {destination,checkin,checkout}=req.body;
      let date1=new Date(checkout)
      let date2=new Date(checkin)
     date1= date1.toISOString().split('T')[0]
     date2= date2.toISOString().split('T')[0]
     memberHelper.findHotelCoords(destination).then((response)=>{
      
      memberHelper.findHotels(response).then((response)=>{
        response.checkin=date2
        response.checkout=date1
      
        console.log(response);
        memberHelper.hotelId(response).then((hotels)=>{
          if(user){
            let users=req.user.toJSON();
            res.render('landing/hotel',{client:true,users,hotels})
          }else if(guide){
            let users=req.user.toJSON();
            res.render('landing/hotel',{member:true,users,hotels})
          }else{
            // res.send(hotels)
            res.render('landing/hotel',{client:true,hotels});
          }
        })
      })
     })
    } catch (error) {
      console.log(error);
    }
   
  }
  exports.hotelSingle=async(req,res)=>{
    const hotel_id=req.params.id;
    const {hotelName,location}=req.query;
    let user=req.cookies.jwt;
    let guide=req.cookies.memberLoginJwt;
    
    memberHelper.findById(hotel_id).then((response)=>{
      // res.send(response)
          const hotelImg=response.filter((value,index)=>{
            return index<9;
          })
         console.log(hotelImg);
          memberHelper.hotelDesc(hotel_id).then((response)=>{
            const hotelDesc=response;
            
            memberHelper.hotelReviews(hotel_id).then((response)=>{
              const hotelReviews=response;
            
              memberHelper.nearbyPlaces(hotel_id).then((response)=>{
                const nearby=response;
                // res.send(nearby)
                memberHelper.hotelMap(hotel_id).then((response)=>{
                  const map=response;
                  if(user){
                    let users=req.user.toJSON();
                    res.render('landing/hotel-single',{client:true,users,hotelImg,hotelDesc,hotelReviews,nearby,map,hotelSingle:true,hotelName,location})
                  }else if(guide){
                    let users=req.user.toJSON();
                    res.render('landing/hotel-single',{member:true,users,hotelImg,hotelDesc,hotelReviews,nearby,map,hotelSingle:true,hotelName,location})
                  }else{
                    // res.send(hotels)
                    res.render('landing/hotel-single',{client:true,hotelImg,hotelDesc,hotelReviews,nearby,map,hotelSingle:true,hotelName,location});
                  }
                  // res.render('landing/hotel-single',{client:true,})
                })
              })
            })
          })
    })
  }
  exports.passwordReset=(req,res)=>{
    res.render('users/password-reset',{client:true,loginmain:true})
  }
  exports.PasswordResetPost=async(req,res)=>{
    const {email}=req.body;
    const user=await User.findOne({email});
    const member=await Member.findOne({email});
  
  
    if(user){
      
         //make sure user exists in db
    try {
      
      // user exists and create onetime link valid for 15 minutes
      const secret=process.env.SECRET_KEY+user.password
      const payload={
        email:user.email,
        id:user._id
      }
      const token=jwt.sign(payload,secret,{expiresIn:'15m'})
      const link=`http://localhost:3000/password-set/${user._id}/${token}`
      const transporter=nodemailer.createTransport({
        service:"gmail",
        host:"smtp.gmail.com",
        secure:true,
        port:"465",
        auth:{
          type:"OAuth2",
          user:"cpjunaif98@gmail.com",
          clientId:process.env.CLIENT_ID,
          clientSecret:process.env.CLIENT_SECRET,
          refreshToken:process.env.GOOGLE_REFRESH_TOKEN
        }
      })
      const options={
        from:"cpjunaif98@gmail.com",
        to:`${email}`,
        subject:"Password reset link for My tour mate",
        text:`Hi ${email}. Please click this link to set new password for your login ${link}`
      }
      transporter.sendMail(options,function(err,info){
        if(err){
          console.log(err);
          return
        }else{
          console.log("emailsend successfully");
        }
        console.log(info.response);
      })
      console.log(link);
      res.render('users/password-thankyou',{thankYou:true,email})
    } catch (error) {
      console.log(error);
    }
    }else if(member){    
         //make sure user exists in db
    try {
      // user exists and create onetime link valid for 15 minutes
      const secret=process.env.SECRET_KEY+member.password
      const payload={
        email:member.email,
        id:member._id
      }
      const token=jwt.sign(payload,secret,{expiresIn:'15m'})
      const link=`http://localhost:3000/password-set/${member._id}/${token}`
      const transporter=nodemailer.createTransport({
        service:"gmail",
        host:"smtp.gmail.com",
        secure:true,
        port:"465",
        auth:{
          type:"OAuth2",
          user:"cpjunaif98@gmail.com",
          clientId:"740736619673-38eae69qmqgh2c8mk9a3a5du8buee8lv.apps.googleusercontent.com",
          clientSecret:"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",
          refreshToken:"1//04hut3J1uBZLoCgYIARAAGAQSNwF-L9Ir0pCSeu8GQrgLfRibV3VLlWkA_0iJ39xLrNPalcnDhSlJ44nzHnTf2CVfnA7vvxCoV38"
        }
      })
      const options={
        from:"cpjunaif98@gmail.com",
        to:`${email}`,
        subject:"Password reset link for My tour mate",
        text:`Hi ${email}. Please click this link to set new password for your login to your dashboard ${link}`
      }
      transporter.sendMail(options,function(err,info){
        if(err){
          console.log(err);
          return
        }else{
          console.log("emailsend successfully");
        }
        console.log(info.response);
      })
      console.log(link);
      res.render('users/password-thankyou',{thankYou:true,email})
    } catch (error) {
      console.log(error);
    }
    }else if(!user&&!member){
      res.render('users/password-reset',{client:true,loginmain:true,message:`There is no email registered with ${email}`})
    }
  
  }
  exports.passwordSet=async(req,res,next)=>{
   try {
    const {id,token}=req.params;
    const _id=mongoose.Types.ObjectId(id);
    // check id exists in db

    const user=await User.findOne({_id}).lean();
  
    if(id!==user._id.toString()){
      
      res.send("invalid user link")
      return
    }
    //if id valid && we have a valid user with this id
    const secret=process.env.SECRET_KEY+user.password
    const payload=jwt.verify(token,secret);
    res.render('users/password-set',{client:true,loginmain:true,email:user.email,id,token})
   
   } catch (error) {
     console.log(error);
     
   }
  }
  exports.passwordSetPost=async(req,res,next)=>{
   try {
    const {id,token}=req.params;
    const {password,cPassword}=req.body
    const _id=mongoose.Types.ObjectId(id);
    // check id exists in db
    const user=await User.findOne({_id}).lean();
    if(id!==user._id.toString()){
      res.send("invalid user link")
      return
    }

    //if id valid && we have a valid user with this id
   const secret=process.env.SECRET_KEY+user.password
   const payload=jwt.verify(token,secret);
  //  validate password and confirm password should mtacth
  if(password===cPassword){
    const salt=await bcrypt.genSalt(10);
    const hashedPass=await bcrypt.hash(password,salt);
    const hashedCPass=await bcrypt.hash(cPassword,salt);
    const passUpdate=await User.updateOne({_id},{
      $set:{
        password:hashedPass,
        cPassword:hashedCPass
      }
    })

  }
  //we can simply find the user with the payload email and update with new password
  res.render('users/loginMain',{client:true,loginmain:true,message:"Password updated successfully plese login with your new credentials"})
   } catch (error) {
     console.log(error);
     res.send("error exists")
   }

    res.render('users/password-reset',{client:true,loginmain:true})
  }


