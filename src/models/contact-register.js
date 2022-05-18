const mongoose=require('mongoose');
const validator=require('validator');

const contactSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    subject:{
        type:String
    },
    message:{
        type:String,
        required:true
    },
    date:{
        type:String,
        default:Date.now()
    }
},{timestamps:true})
const Contact=new mongoose.model("Contact",contactSchema);
module.exports=Contact