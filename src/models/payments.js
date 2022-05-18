const mongoose=require('mongoose');
const mongoosePaginate=require('mongoose-paginate-v2');
const paymentsSchema=new mongoose.Schema({
    id:{
        type:String,
        require:true
    },
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    status:{
        type:String,
    },
    orderId:{
        type:String,
        required:true
    },
    payLater:{
        type:Boolean,
    },
    amount:{
        type:String,
    },
    date:{
        type:Date
    },
    acceptStatus:{
        type:Boolean,
        default:false
    },
    acceptOrReject:{
        type:String
    }

    },
    
    {timestamps:true});
    paymentsSchema.plugin(mongoosePaginate);

module.exports=mongoose.model("Payment",paymentsSchema);