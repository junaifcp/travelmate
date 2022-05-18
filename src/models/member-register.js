
const mongoose = require('mongoose');
const bcrypt=require('bcryptjs');
const res = require('express/lib/response');
const jwtMember=require('jsonwebtoken')
const mongoosePaginate=require('mongoose-paginate-v2');
const { date } = require('joi');

 const memberSchema = new mongoose.Schema({
    firstName : {
        type:String,
        required:true,
        lowercase:true,
        minlength:3,
        maxlength:30
    },
    lastName : {
        type:String,
        required:true,
        lowercase:true
    },
    userName:{
        type:String,
        required:true,
        unique:true
    },
    email : {
        type:String,
        required:true,
        unique:true
    },
    gender : {
        type:String,
        required:true
    },
    memberPhone : {
        type:String,
        required:true,
        unique:true
    },
    memberAge : {
        type:Number,
        required:true
    }, 
    password : {
        type:String,
        required:true
    },
    cPassword : {
        type:String,
        required:true
    },
    position : {
        type:String,
        required:true
    },
    country : {
        type:String,
        required:true
    },
    place : {
        type:String,
        required:true
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
    languages:{
        type:String
    },
    area : {
        type:String,
        
    },
    education : {
        type:String,
    },
    destination : {
        type:String,     
    },
    bio : {
        type:String,      
    },
    profilePicId:{
        type:String,
        default:"dummy-profile.webp"
    },
    postCount:{
        type:Number,
        default:0
    },
    queries:[
        {
            name:{type:String},
            email:{type:String},
            subject:{type:String},
            details:{type:String},
            date:{type:Date,default:Date.now()}
        }
    ],
    amountPay:{
        type:String,

    },
    account:[
        {
         
            name:{
                type:String,
        
            },
            bank:{
                type:String,
        
            },
            branch:{
                type:String,
        
            },
            accNumber:{
                type:String,
        
            },
            cAccNumber:{
                type:String,
        
            },
            ifsc:{
                type:String,
            },
            date:{
                type:Date,
            }
        }
    ],
    payments:[
        {
            userEmail:{
                type:String,
                required:true
            },
            amount:{
                type:Number,
                required:true
            },
            date:{
                type:Date,
                default:Date.now()
            }
        }
    ],
    wallet:{
        type:Number,
        default:0
    },
    socialLinks : [{
        facebook : {
             type:String
        },
        instagram : {
            type:String
       }, facebook : {
             type:String
        },
        linkedIn : {
            type:String
       },
       twitter : {
        type:String
       }  
    }],
    feedbacks:[
        {
            username:{
                type:String
            },
            feedback:{
                type:String
            },
            rating:{
                type:Number,
                
            },
            date:{
                type:String
            }
        }
    ],
    portfolio:{
     type:Array
    },
    tokens : [{
        token : {
             type:String,
             required:true
        } 
    }]
    

},{timestamps:true});
memberSchema.plugin(mongoosePaginate);
// memberSchema.method("toJSON", function() {
//     const { __v, _id, ...object } = this.toObject();
//     object.id = _id;
//     return object;
//   });
memberSchema.methods.toPostConcat=async function(){
    try {
        console.log(this._id+"generated id");

        this.posts=this.posts.concat({posts});
        await this.save();

    } catch (error) {
        console.log(error);
    }
}
memberSchema.methods.generateAuthTokenMember=async function(){
    try {
        console.log(this._id+"generated id");
        console.log(this._id.toString());
        const token = jwtMember.sign({_id:this._id},process.env.SECRET_KEY);
        console.log(token);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        res.send("the error part");
        console.log("the error part"+error);
    }
}
//converting password into hash
memberSchema.pre("save",async function(next){
    if(this.isModified("password")){
     
    this.password =await bcrypt.hash(this.password,10);
   
    this.cPassword=await bcrypt.hash(this.password,10);
    }
    next();
})
const Member = new mongoose.model("Member", memberSchema);
module.exports=Member;

