const mongoose = require('mongoose');

const Connect=async()=>{
    try {
       const conn=await mongoose.connect(process.env.MONGO_URI,{
        useNewUrlParser:true,
        useUnifiedTopology:true
       });
       console.log(`MongoDB connected successfully`)
    } catch (error) {
        console.log("error occured while connecting");
        process.exit(1)
    }
}
module.exports=Connect;
