
const User=require('../../src/models/user-register');
const Member=require('../../src/models/member-register');
const Categories=require('../../src/models/category');
const Post=require('../../src/models/post');
const Payment=require('../../src/models/payments');
const Contact=require('../../src/models/contact-register');
const mongoose=require('mongoose');
const { ObjectId } = require('mongodb');
const memberHelper=require('../../src/controler/member-functions')
const destCat=require('../../src/models/destCategory')


exports.admin=(req, res)=>{
    res.render('admin/login',{adminLogin:true})
  }

exports.login=async(req,res)=>{
  console.log(req.body);
  console.log(process.env.PASSWORD);
  if(req.body.username===process.env.USER_NAME&&req.body.password===process.env.PASSWORD){
    const accessToken=await memberHelper.signAccessToken(process.env.USER_NAME)
    res.cookie("adminToken",accessToken,{httpOnly:true})
    res.redirect('/admin/dashboard')
  }else{
    res.json({message:'passwords is not matching'})
  }
} 
exports.logout=(req,res)=>{
 res.clearCookie('adminToken');
 res.render('admin/login',{adminLogin:true,message:"logout successfully...!!"})
}
exports.dashboard= async(req,res)=>{
 try {
   const admin=req.admin;
   console.log(admin);
   if(admin){
    const users=await User.find().sort({createdAt:-1}).limit(10).lean()
    const members=await Member.find().sort({createdAt:-1}).limit(10).lean()
    const categories=await Categories.find().sort({count:-1}).limit(20).lean()
    const posts=await Post.find().sort({createdAt:-1}).limit(10).lean()
    const payments=await Payment.find().sort({createdAt:-1}).limit(15).lean()
    const contact=await Contact.find().sort({createdAt:-1}).limit(10).lean()
    const count={
      userCount:await User.count({}),
      guideCount:await Member.count({}),
      postCount:await Post.count({})
    }

    
    res.render('admin/dashboard',{admin:true,users,members,categories,posts,payments,count,contact})
   }else{
    res.render('admin/login',{adminLogin:true,message:"Please login to access your dashboard...!!"})
   }
 } catch (error) {
   console.log(error);
 }
}
exports.deleteUser=async(req,res)=>{
  try {
    const _id=mongoose.Types.ObjectId(req.params.id);
    // console.log(users);
    const user=await User.remove({_id})
   
    res.redirect('/admin/dashboard')
  } catch (error) {
    console.log(error);
  }
}
exports.blockUser=async(req,res)=>{
  const _id=mongoose.Types.ObjectId(req.params.id);
  const status=await User.findOne({_id},{blockStatus:1})
  console.log(status);
  if(status.blockStatus){
    const user=await User.updateOne({_id:_id},{
      $set:{
        blockStatus:false
      }
    })
  }else{
    const user=await User.updateOne({_id:_id},{
      $set:{
        blockStatus:true
      }
    })
  }
  
  res.redirect('/admin/dashboard')
}
exports.touristsAll=async(req,res)=>{
try {
  const count={
    userCount:await User.count({}),
    guideCount:await Member.count({}),
    postCount:await Post.count({})
  }
  const limit=parseInt(req.query.limit,10)||10;
  const page=parseInt(req.query.page,10)||1;
  let tourists= await User.paginate({},{limit,page,sort:{createdAt:-1},lean:true})

  res.render('admin/tourists-all',{admin:true,tourists,count})
} catch (error) {
  console.log(error);
  res.send("error occured")
}
}
exports.guidesAll=async(req,res)=>{
  try {
    const count={
      userCount:await User.count({}),
      guideCount:await Member.count({}),
      postCount:await Post.count({})
    }
    const limit=parseInt(req.query.limit,10)||10;
    const page=parseInt(req.query.page,10)||1;
    let guides= await Member.paginate({},{limit,page,sort:{createdAt:-1},lean:true})

    res.render('admin/guides-all',{admin:true,guides,count})
  } catch (error) {
    console.log(error);
    res.send("error occured")
  }
}
exports.postsAll=async(req,res)=>{
  try {
    const count={
      userCount:await User.count({}),
      guideCount:await Member.count({}),
      postCount:await Post.count({})
    }
  
    const limit=parseInt(req.query.limit,10)||10;
    const page=parseInt(req.query.page,10)||1;
    let posts= await Post.paginate({},{limit,page,sort:{createdAt:-1},lean:true})

    res.render('admin/posts-all',{admin:true,posts,count})
  } catch (error) {
    console.log(error);
    res.send("error occured")
  }
}
exports.paymentsAll=async(req,res)=>{
  try {
    const count={
      userCount:await User.count({}),
      guideCount:await Member.count({}),
      postCount:await Post.count({})
    }
    console.log(count)
    const limit=parseInt(req.query.limit,10)||10;
    const page=parseInt(req.query.page,10)||1;
    let payments= await Payment.paginate({},{limit,page,sort:{createdAt:-1},lean:true})

    res.render('admin/payments-all',{admin:true,payments,count})
  } catch (error) {
    console.log(error);
    res.send("error occured")
  }
 
}
exports.destination=async(req,res)=>{
  try {
    const categories=await destCat.find().lean()
    res.render('admin/destination-add',{admin:true,categories})
  } catch (error) {
    console.log(error);
    res.send("error occured")
  }
}