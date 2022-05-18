const mongoose=require('mongoose');

const CategorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    count:{
        type:Number,
        default:0
    }
    },
    {timestamps:true}
    );

module.exports=mongoose.model("Category",CategorySchema);
