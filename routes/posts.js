const router=require('express').Router();
const Post=require('../src/models/post');
const Category=require('../src/models/category');
const Member=require('../src/models/member-register')
const store=require('../src/middleware/multer');
const auth=require('../src/middleware/memberAuth')
//CREATE
router.post('/',[store.array('images',1),auth],async(req,res)=>{
    const files=req.files;
    const category=req.body.categories;
    if(req.cookies.memberLoginJwt){
        const users=req.user.toJSON();
    console.log(category);
    console.log(req.body);
    try {
        const newCat=await Category.findOne({name:category});
        const postCount=await Member.findOneAndUpdate({userName:users.userName},{
            $inc:{postCount:1}
        })
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
            console.log(saveCat);
        }
        const newPost=new Post({
            title:req.body.title,
            desc:req.body.desc,
            markdown:req.body.markdown,
            photo:files[0].filename,
            username:req.body.username,
            categories:category,
        })
        const savedPost=await newPost.save()

       res.redirect('/members/dashboard/add-post')
    } catch (error) {
      res.status(500).json(error+"the error part")
    }
    }else if(req.cookies.adminToken){

    console.log(req.body);
    try {
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
            console.log(saveCat);
        }
        const newPost=new Post({
            title:req.body.title,
            desc:req.body.desc,
            markdown:req.body.markdown,
            photo:files[0].filename,
            username:req.body.username,
            categories:category,
        })
        const savedPost=await newPost.save()

       res.redirect('/admin/dashboiard')
    } catch (error) {
      res.status(500).json(error+"the error part")
    }
    }    
  })
//UPDATE

router.put('/:id',async(req,res)=>{
    
    try {
        const post=await Post.findById(req.params.id);
        if(post.username===req.body.username){
              try {
                  const updatedPost=await Post.findByIdAndUpdate(req.params.id,{
                      $set:req.body
                  },{new:true})
                  res.status(200).json(updatedPost)
              } catch (error) {
                res.status(500).json(error)
              } 
        }else{
            res.status(401).json("you can update only on your post")
        }

    } catch (error) {
        res.status(500).json(error)
    }
})
  module.exports=router