const mongoose=require('mongoose');

const destCategorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    desc:{
        type:String
    },
    photo:{
        type:String
    },
    count:{
        type:Number,
        default:0
    }
    },
    {timestamps:true}
    );

module.exports=mongoose.model("DestCategory",destCategorySchema);
