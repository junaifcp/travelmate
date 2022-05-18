const router=require('express').Router();
const Destination=require('../src/models/destination');
const Category=require('../src/models/destCategory');
const store=require('../src/middleware/multer');
const auth=require('../src/middleware/memberAuth')
router.post('/',[store.array('images',6),auth],async(req,res)=>{
    const files=req.files;
    console.log(files);
    const category=req.body.categories;
    if(!files){
        const error=new Error('Please choose files')
        error.httpStatusCode=400;
        return next(error)
    }
    const newCat=await Category.findOne({name:category});
    if(newCat){
        const updateCatCount=await Category.findOneAndUpdate({name:category},{
            $inc:{count:1}
        });
    }
    if(!newCat){
        const addCat=new Category({
            name:category,
            count:1
        });
        const saveCat=await addCat.save()
    }
    let result = files.map((src,index)=>{
           return filename=files[index].filename
    })
    const addDestination=new Destination({
           title:req.body.title,
           desc:req.body.desc,
           markdown:req.body.markdown,
           photo:result,
           username:req.body.username,
           categories:req.body.categories 
    })
    const savedDestination=await addDestination.save()
    res.redirect('/admin/destination')
})
router.get('/',async(req,res)=>{
   
})


module.exports=router