const Member = require('../../src/models/member-register');
const Payment = require('../../src/models/payments');
const bcrypt=require('bcryptjs');
const mongoose=require('mongoose')
const UploadModel=require('../models/imageSchema')
const fs = require('fs')
const User=require('../../src/models/user-register');
const checksum_lib = require("../../Paytm/checksum");
const config = require("../../Paytm/config");
const qs=require('querystring')
const Post=require('../models/post');
const methodOverride = require('method-override');
const memberHelper=require('../../src/controler/member-functions')
const Razorpay=require('razorpay')
const nodemailer=require('nodemailer')
const Categories=require('../../src/models/category')
// loading posts for pagination
// instance of razorpay
var instance = new Razorpay({
    key_id: 'Yrzp_live_sk9XWeoqnDR7lL',
    key_secret: 'nVY3OyfLVJhpSvF3siqdZamo',
  });

//edit profile button route in member dashboard method GET
exports.editProfile=async function(req,res,next){  
    let users=req.user.toJSON();
    res.render('members/editProfile',{editProfile:true,users:users})
}
//edit profile route in member dashboard method POST
exports.updateProfile=async function(req,res,next){
    const _id=mongoose.Types.ObjectId(req.params.id);
    const updations=req.body;
    const member = await Member.updateOne({_id:_id},{
        $set:{
            firstName:updations.firstName,
            lastName:updations.lastName,
            email:updations.email,
            memberPhone:updations.memberPhone,
            country:updations.country,
            address1:updations.address1,
            address2:updations.address2,
            pinCode:updations.pinCode,
            state:updations.state,
            area:updations.area,
            languages:updations.languages,
            offer:updations.offer,
            education:updations.education,
            destination:updations.region,
            bio:updations.bio
        }
    },{upsert:true});
    res.redirect('/members/dashboard')
}
//edit member profile pic route method GET
exports.editPic= async function (req,res){ 
    let user=req.user.toJSON()
  res.render('members/edit-profile-pic',{user:user})
}
//update member profile pic route method POST
exports.uploadProfile=async(req,res,next)=>{
   const files=req.files;
   console.log(files);
   if(!files){
    const error=new Error('Please choose files')
    error.httpStatusCode=400;
    return next(error)
}
//convert images into base 64 cncoding
let imgArray=files.map((file)=>{
    let img=fs.readFileSync(file.path)
    return encode_image= img.toString('base64')
})    
let result= imgArray.map(async(src,index)=>{
    //create object to store data in collection
    let finalImg={
        filename:files[index].filename,
        contentType:files[index].mimetype,
        imageBase64:src
    }
    let newUpload=new UploadModel(finalImg);
    const _id=mongoose.Types.ObjectId(req.params.id);
    const image=newUpload.filename;
    const member = await Member.updateOne({_id:_id},{
        $set:{
            profilePicId:image
        }
    },{upsert:true});
    return newUpload
    .save()
    .then(()=>{
        
        return {msg:`${files[index].originalname}image uploaded successfully`}
    })
    .catch(error=>{
        if(error){
            if(error.name==='MongoError' && error.code===11000){
                return Promise.reject({error:`Duplicate ${files[index].originalname}. File already exist`})
            }
            return Promise.reject({error:error.message || `Cannot upload ${files[index].originalname}`})
        }
    })
});
Promise.all(result)
.then((msg)=>{
    // res.json(msg)
    res.redirect('/members/dashboard')
})
.catch(err=>{
    res.render('404',{error:true,err})
})
}
//dashboard router. Display member dashboard after authentication
exports.dashboard=async function(req, res, next) {

    try {  
        // let member=JSON.stringify(req.user)
        // const users=await Member.findById({_id:member._id},{tokens:0,socialLinks:0});
        const users=req.user.toJSON();
        const username=users.userName;
        const posts=await Post.find({username}).lean()
  
        //   profile=await profile.toJSON();
        res.render('members/dashboard',{member:true,posts,memberStyle:true,users});
    } catch (e) {
        console.log("error occured while loading dashboard"+e);
    }
   
  };
  //adding social media links in the profile. To display edit form
exports.editSocial=async function(req,res){
      let user=req.user.lean();
      res.render('members/edit-social', {adminLogin:true,user})
  }
//add and update social media links of the members
exports.editSocialPost=async(req,res,next)=>{
    const _id=mongoose.Types.ObjectId(req.params.id);
    const links=req.body;
    const member = await Member.updateOne({_id:_id},{
        $set:{
            socialLinks: [
                {
                    facebook:links.facebook
                },
                {
                    instagram:links.instagram
                },
                {
                    twitter:links.twitter
                },
                {
                    linkedIn:links.linkedIn
                }
            ]
        }
    },{upsert:true});
   res.redirect('/members/dashboard')
  }
  exports.viewProfile=async(req,res)=>{
      try {
        const _id=req.params.id;
        const userApi=await Member.findOne({_id}).lean();
        const payments=userApi.payments
        const posts=await Post.find({username:userApi.userName}).lean()
        let user=req.cookies.jwt;
        let guide=req.cookies.memberLoginJwt;
        if(user){
            let users=req.user.toJSON();
            let isFeedback=payments.some((value)=>{
                return value.userEmail==users.email
            })
          res.render('members/member',{memberStyle:true,users,client:true,userApi,body:true,posts,isFeedback})
        }else if(guide){
            let users=req.user.toJSON();
            let isFeedback=payments.some((value)=>{
                return value.userEmail==users.email
            })
          res.render('members/member',{memberStyle:true,users,member:true,userApi,body:true,posts,isFeedback})
        }else{
           
          res.render('members/member',{memberStyle:true,client:true,body:true,posts,userApi});
        } 
      } catch (err) {
        res.render('404',{error:true,err})
      }
  }
  exports.contactProfile=async(req,res)=>{
    try {
        const _id=req.params.id;
        const userApi=await Member.findOne({_id}).lean();
        let user=req.cookies.jwt;
        let guide=req.cookies.memberLoginJwt;
        if(user){
            let users=req.user.toJSON();
          res.render('members/member',{memberStyle:true,users,client:true,userApi,contact:true})
        }else if(guide){
            let users=req.user.toJSON();
          res.render('members/member',{memberStyle:true,users,member:true,userApi,contact:true})
        }else{
          res.render('members/member',{memberStyle:true,client:true,contact:true,userApi});
        } 
      } catch (err) {
        res.render('404',{error:true,err})
      }
  }
  exports.contactProfilePost=async(req,res)=>{
      try {
        let user=req.cookies.jwt;
        let guide=req.cookies.memberLoginJwt;
        const _id=req.params.id;
        const userApi=await Member.findOne({_id}).lean();
        const updated=await Member.updateOne({_id},{
            $push:{
                queries:[req.body]
            }
        })
        if(user){
            let users=req.user.toJSON();
          res.render('members/member',{memberStyle:true,users,client:true,userApi,contact:true})
        }else if(guide){
            let users=req.user.toJSON();
          res.render('members/member',{memberStyle:true,users,member:true,userApi,contact:true})
        }else{
          res.render('members/member',{memberStyle:true,client:true,contact:true,userApi});
        } 
        
      } catch (err) {
        res.render('404',{error:true,err})
      }
  

  }
  exports.addPost=async(req,res)=>{
    try {
        let user=req.cookies.jwt;
        let guide=req.cookies.memberLoginJwt;
        const categories=await Categories.find().lean()
        if(user){
          let users=req.user.toJSON();
          res.render('members/add-post',{client:true,memberStyle:true,users,contact:true,categories})
        }else if(guide){
          let users=req.user.toJSON();
          res.render('members/add-post',{member:true,memberStyle:true,users,contact:true,categories})
        }else{
          res.render('members/add-post',{client:true,memberStyle:true,contact:true,categories});
        } 
      } catch (err) {
        res.render('404',{error:true,err})
      }
  }
  exports.addPostPost=async(req,res,next)=>{
       try {
           const _id=req.user._id;
           const post=req.body;
           console.log(post);
           const member= await Member.updateOne({_id},{
               $push:{
                   posts:[
                       {
                           post:[{
                            title:post.title,
                            subject:post.subject,
                            content:post.content,
                           }]
                       }
                   ]
               }
           });
        //    const toPost=await member.toPostConcat();
           res.redirect("/members/dashboard")
           
       } catch (err) {
        res.render('404',{error:true,err})
       }
  }
  exports.editPost=async(req,res)=>{
    try {
        const post=await Post.findOne({_id:req.params.id}).lean()
        const categories=await Categories.find().lean()
        const users=req.user.toJSON();
        res.render('members/edit-post',{memberStyle:true,users,contact:true,post,categories})
      } catch (err) {
          console.log(error);
      }
  }
  exports.uploadCover=async(req,res,next)=>{
      const _id=req.params.id;
      console.log((_id+"  cover pic id"));
          
      res.render('members/edit-cover-pic',{_id})
  }
  exports.uploadCoverPost=async(req,res)=>{

    try {
        const files=req.files;
        if(!files){
         const error=new Error('Please choose files')
         error.httpStatusCode=400;
         return next(error)
     }
     let imgArray=files.map((file)=>{
        let img=fs.readFileSync(file.path)
        return encode_image= img.toString('base64')
    })  
    let result= imgArray.map(async(src,index)=>{
        //create object to store data in collection
        let finalImg={
            filename:files[index].filename,
            contentType:files[index].mimetype,
            imageBase64:src
        }
        let newUpload=new UploadModel(finalImg);
        const _id=mongoose.Types.ObjectId(req.params.id);
        const image=newUpload.filename;
        const member = await Member.findOne()

        console.log(member);
        return newUpload
        .save()
        .then(()=>{
            
            return {msg:`${files[index].originalname}image uploaded successfully`}
        })
        .catch(error=>{
            if(error){
                if(error.name==='MongoError' && error.code===11000){
                    return Promise.reject({error:`Duplicate ${files[index].originalname}. File already exist`})
                }
                return Promise.reject({error:error.message || `Cannot upload ${files[index].originalname}`})
            }
        })
    });
    Promise.all(result)
    .then((msg)=>{
        // res.json(msg)
        res.redirect('/members/dashboard')
    })
    .catch(err=>{
        res.json(error)
    })
        

    } catch (err) {
        res.render('404',{error:true})
    }
      
      res.send('post')
  }
  exports.feedback=async(req,res,next)=>{
    try {
        const user=req.user.toJSON();
        const _id=req.params.id;
        const username=user.userName;
        const updateFeedback=await Member.updateOne({_id},{
            $push:{
                feedbacks:[
                   {
                        username:username,
                        feedback:req.body.feedback,
                        rating:req.body.star,
                        date:Date.now()
                   }
                ]
            }
        })
        console.log(updateFeedback);
        res.send('successfull')

    } catch (err) {
        res.render('404',{error:true,err})
    }
     
  }
  exports.portfolio=(req,res)=>{
    try {
        const users=req.user.toJSON()
        res.render('members/portfolio',{memberStyle:true,users,member:true})
      } catch (error) {
          console.log(error);
      }
  }
  exports.portfolioPost=async(req,res)=>{
    const files=req.files;
    
    if(!files){
     const error=new Error('Please choose files')
     error.httpStatusCode=400;
     return next(error)
 }
 let result = files.map(async(src,index)=>{
     let portfolioImg={
         filename:files[index].filename
     }
     const _id=mongoose.Types.ObjectId(req.params.id);
     const member=await Member.updateOne({_id:_id},{
         $push:{
             portfolio:portfolioImg
         }
     })
 })
Promise.all(result)
.then((msg)=>{
    res.redirect('/members/dashboard/portfolio')
})
.catch(err=>{
    res.render('404',{error:true,err})
})
}
exports.feedbackMember=(req,res)=>{
    let users=req.user.toJSON();
    res.render('members/feedback',{memberStyle:true,users,member:true})
}

exports.payments=async(req,res)=>{
    let users=req.user.toJSON();
    const id=users._id.toString()
    const payments=await Payment.find({id}).sort({createdAt:-1}).lean()
    const accepted=await Payment.find({acceptStatus:true}).lean()
    res.render('members/payments',{memberStyle:true,users,member:true,payments,accepted})
}
exports.guideMessages=async(req,res)=>{
    let users=req.user.toJSON();
    res.render('members/messages',{memberStyle:true,users,member:true})
}
exports.amount=async(req,res)=>{
    const userApi=req.user.toJSON();
    console.log(userApi);
    const memberBank=await Member.findOneAndUpdate({_id:userApi._id},{
        $set:{
            amountPay:req.body.amountPay
        }
    })
    res.render('members/payments',{memberStyle:true,userApi,member:true})
}
exports.bankDetails=async(req,res)=>{
  try {
    const userApi=req.user.toJSON();
    const accNumber=req.body.accNumber;
    const cAccNumber=req.body.cAccNumber
    if(accNumber===cAccNumber){
        const memberBank=await Member.findOneAndUpdate({_id:userApi._id},{
            $set:{
                account:[
                    {
                        name:req.body.name,
                        bank:req.body.bank,
                        branch:req.body.branch,
                        accNumber:req.body.accNumber,
                        cAccNumber:req.body.cAccNumber,
                        name:req.body.ifsc,
                    }
                ]
            }
        })
    }else{
        res.send("entered acc number are not same")
    }
    res.render('members/payments',{memberStyle:true,userApi,member:true})
  } catch (err) {
    res.render('404',{error:true,err})
  }
}
exports.getMyTime=async(req,res)=>{
    try {
        const _id=req.params.id;
        const userApi=await Member.findOne({_id}).lean();
        if(req.cookies.jwt){
            let users=req.user.toJSON();
            res.render('members/member',{memberStyle:true,userApi,users,getTime:true,_id,client:true})
        }else if(req.cookies.memberLoginJwt){
            let users=req.user.toJSON();
            res.render('members/member',{memberStyle:true,userApi,users,getTime:true,_id,member:true})
        }else{
            res.redirect('/loginMain')
        }
       
        
    } catch (err) {
        res.render('404',{error:true,err})
    }
    // res.send('get my time')
}
exports.getMyTimePost=async(req,res)=>{
    try {
        const data=req.body;
        res.cookie('talkTime', data,{httpOnly:true});
        const _id=req.params.id;
      if(req.cookies.jwt){ 
        const member=await Member.findOne({_id}).lean();
        const userApi=req.user.toJSON()
        res.render('members/thank-you-time',{_id,thankYou:true,userApi,member,client:true})
      }else if(req.cookies.memberLoginJwt){
        const member=await Member.findOne({_id}).lean();
        const userApi=req.user.toJSON()
        res.render('members/thank-you-time',{_id,thankYou:true,userApi,member})
      }else{
        res.render('users/login-main',{loginmain:true,message:"You are not a member... Please login to get your guide"});
      }
        
    } catch (err) {
        res.render('404',{error:true,err})
    }
    // res.send('get my time')
}
exports.getTheTime=async(req,res)=>{
   const member=await Member.findOne({_id:req.query.member})
   
    const userApi=req.user.toJSON()
    const orderId=userApi._id.toString();
    memberHelper.generateRazorPay(orderId,member).then((response)=>{

        console.log(response);
        res.send(response);
    })
    // console.log(orderId);
    // console.log("entered");
    // res.status(200).json({message:"success"})
}
exports.verifyPayment=async(req,res)=>{
    const memberId=req.query.member
    const userApi=req.user.toJSON()
    const talkTime=req.cookies.talkTime;
    let date=new Date(talkTime.date);
    date.toString();
    console.log(date);
   
    memberHelper.paymentVerify(req.body).then(async(resolve)=>{
        console.log(resolve);
        const paymentUpdate=await Member.findOneAndUpdate({_id:memberId},{
            $push:{
                payments:[
                    {
                        userEmail:userApi.email,
                        amount:resolve['order[amount]'],
                    }
                ]
            },
            $inc:{wallet:resolve['order[amount]']/100}
        })
        const paymetList=new Payment({
            id:memberId,
            name:userApi.firstName,
            email:userApi.email,
            status:"success",
            orderId:resolve['payment[razorpay_order_id]'],
            amount:resolve['order[amount]']/100,
            payLater:false,
            date:date,
            time:talkTime.time,
        })
        const result=await paymetList.save();
        // 
        res.send("Payment recieved successfully. Please check your email for more information");
        
        // const walletUpdate=await Member.findOneAndUpdate({_id:memberId},{
        //     $in:{wallet:resolve['order[amount]']}
        // })

    }).catch((e)=>{
        res.send("Your transaction has been failed due some network error...")
    })

}
exports.sendEmail=async(req,res)=>{
    try {
        const {email,phone,member,name}=req.query;
        const _id=mongoose.Types.ObjectId(member);
        const guide=await Member.findOne({_id});
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
            subject:"Payment for finding guide",
            text:`Hi ${email}, Your payment amount of ${guide.amountPay} has been recieved successfully
            You will get notified after ${name} accepted your payment. Otherwise your amount will be refunded to your account back. Thank you`
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
          res.send("email send successfully")
    } catch (err) {
        res.render('404',{error:true,err})
    }
}
exports.sendGuideEmail=async(req,res)=>{
    try {
        console.log(req.query);
        const {id,email,phone,member,name}=req.query;
        const _id=mongoose.Types.ObjectId(member);
        const guide=await Member.findOne({_id});
        const accept=`http://localhost:3001/accept?email=${email}&id=${id}`
        const reject=`http://localhost:3001/reject?email=${email}&id=${id}`
        const talkTime=req.cookies.talkTime;
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
            to:"quicklaborer@gmail.com",
            subject:"Payment recieved",
            text:`Hi ${guide.firstName}, Your payment amount of ${guide.amountPay} has been recieved debited to your wallet.
            Please click the link to accept the payment for your to ${talkTime.userName} on ${talkTime.date} between ${talkTime.time}. Please click here to accept ${accept}. If you are not free at the mentioned time click ${reject} to declain the request. Thank you`
          } 
          transporter.sendMail(options,function(err,info){
            if(err){
                res.render('404',{error:true,err})
            
            }else{
              console.log("emailsend successfully");
            }
            console.log(info.response);
          })
          res.clearCookie('talkTime');
          res.send("email send to guide for accept")
    } catch (err) {
        res.render('404',{error:true,err})
    }
}
exports.getTheTimeLater=async(req,res)=>{
    let {status,payLater,id,amount}=req.query;
    const talkTime=req.cookies.talkTime;
    console.log(talkTime);
    let date=new Date(talkTime.date);
    date.toString();
    console.log(id);
    const userApi=req.user.toJSON();
    const paymetList=new Payment({
        id:id,
        name:userApi.firstName,
        email:userApi.email,
        status:status,
        orderId:status,
        payLater:payLater,
        amount:amount,
        date:date,
        time:talkTime.time,
    })
    const result=await paymetList.save();
    // send email to tourist and guide on paylater
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
        to:`quicklaborer@gmail.com`,
        subject:"Payment for finding guide",
        text:`Hi ${userApi.email}, Your payment amount of ${amount} is pending. You will be notified after when you get out guides service for future payments.
        You will get notified after guide accepted your request. Thank you`
      }
    //   ${userApi.email}
      transporter.sendMail(options,function(err,info){
        if(err){
          console.log(err);
          return
        }else{
          console.log("emailsend successfully");
        }
        console.log(info.response);
      })
    // end of email
    res.clearCookie('talkTime');
    res.render('members/thank-you-time',{id,thankYou:true,userApi,message:"You booking request recieved successfully... Please check your Email for more"})
}
exports.accept=async(req,res)=>{
   try {
    const {email,id}=req.query;
    console.log(id+"  order id");
    // const updatePayment=await Payment.find({id:id}
    const updatePayment=await Payment.updateOne({orderId:id},{
        $set:{
            acceptStatus:true
        }
    })
    console.log(updatePayment);
    res.redirect("/")
   } catch (error) {
       console.log(error);
       res.send("error occurred")
   }
}
exports.reject=async(req,res)=>{
    try {
        const {email,id}=req.query;
        const updatePayment=await Payment.findOneAndUpdate({orderId:id},{
            $set:{
                acceptStatus:false
            }
        },{upsert:true})
        res.redirect("/")
       } catch (error) {
           console.log(error);
           res.send("error occurred")
       }
}
exports.payForTime=async(req,res)=>{
    const _id=req.params.id;
    const users=req.user.toJSON();
    // post router

    // app.post("/paynow", [parseUrl, parseJson], (req, res) => {
        // Route for making payment
      
        var paymentDetails = {
          amount: req.body.amount,
          customerId: req.body.name,
          customerEmail: req.body.email,
          customerPhone: req.body.phone
      }
      if(!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
          res.status(400).send('Payment failed')
      } else {
          var params = {};
          params['MID'] = config.PaytmConfig.mid;
          params['WEBSITE'] = config.PaytmConfig.website;
          params['CHANNEL_ID'] = 'WEB';
          params['INDUSTRY_TYPE_ID'] = 'Retail';
          params['ORDER_ID'] = 'TEST_'  + new Date().getTime();
          params['CUST_ID'] = paymentDetails.customerId;
          params['TXN_AMOUNT'] = paymentDetails.amount;
          params['CALLBACK_URL'] = 'http://localhost:3000/callback';
          params['EMAIL'] = paymentDetails.customerEmail;
          params['MOBILE_NO'] = paymentDetails.customerPhone;
      
      
          checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
              var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
              // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production
      
              var form_fields = "";
              for (var x in params) {
                  form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
              }
              form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";
      
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
              res.end();
          });
      }
}
exports.callBack=(req,res)=>{
        // Route for verifiying payment
      
        var body = '';
      
        req.on('data', function (data) {
           body += data;
        });
      
         req.on('end', function () {
           var html = "";
           var post_data = qs.parse(body);
      
           // received params in callback
           console.log('Callback Response: ', post_data, "\n");
      
      
           // verify the checksum
           var checksumhash = post_data.CHECKSUMHASH;
           // delete post_data.CHECKSUMHASH;
           var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
           console.log("Checksum Result => ", result, "\n");
      
      
           // Send Server-to-Server request to verify Order Status
           var params = {"MID": config.PaytmConfig.mid, "ORDERID": post_data.ORDERID};
      
           checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
      
             params.CHECKSUMHASH = checksum;
             post_data = 'JsonData='+JSON.stringify(params);
      
             var options = {
               hostname: 'securegw-stage.paytm.in', // for staging
               // hostname: 'securegw.paytm.in', // for production
               port: 443,
               path: '/merchant-status/getTxnStatus',
               method: 'POST',
               headers: {
                 'Content-Type': 'application/x-www-form-urlencoded',
                 'Content-Length': post_data.length
               }
             };
      
      
             // Set up the request
             var response = "";
             var post_req = https.request(options, function(post_res) {
               post_res.on('data', function (chunk) {
                 response += chunk;
               });
      
               post_res.on('end', function(){
                 console.log('S2S Response: ', response, "\n");
      
                 var _result = JSON.parse(response);
                   if(_result.STATUS == 'TXN_SUCCESS') {
                       res.send('payment sucess')
                   }else {
                       res.send('payment failed')
                   }
                 });
             });
      
             // post the data
             post_req.write(post_data);
             post_req.end();
            });
           });
}
exports.addFigure=async(req,res)=>{
    res.send("success")
}



