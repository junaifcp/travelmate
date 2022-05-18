const multer=require('multer');
const path=require('path')

//storage set
// usinng this method I'm going to specify where I want toi store all images inside disc

var storage=multer.diskStorage({
    
     //wheree i want to upload all images
    destination:function(req,file,cb){
        cb(null,'public/uploads') //null : if user uploaded something wrong, then we can pass error message using null argument
    },
    //rename the image to get unoque name
    filename: function(req,file,cb){
        //this will return last index of '.' after into ext
        var ext=file.originalname.substring(file.originalname.lastIndexOf("."))
        cb(null,file.fieldname+'-'+Date.now()+ext);
    }
})

//set the storage configoration to know multer module about storage setting
store=multer({storage:storage});
module.exports=store;
