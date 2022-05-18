const router=require('express').Router();
const DestCategory=require('../src/models/destCategory');
const store=require('../src/middleware/multer')
router.post('/',[store.array('photo')],async(req,res)=>{
    const newCat=new DestCategory({
        name:req.body.name,
        desc:req.body.desc,
        photo:req.files[0].filename
    });
    try {
        const savedCat=await newCat.save()
        res.redirect('/admin/destination')
    } catch (error) {
        res.status(500).json(error)
    }

})
router.get('/',async(req,res)=>{
    try {
        const cats=await Category.find()
        res.status(200).json(cats)
    } catch (error) {
        res.status(500).json(error)
    }
})


module.exports=router