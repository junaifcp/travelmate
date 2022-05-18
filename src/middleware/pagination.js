const Post=require('../models/post')
const Member=require('../models/member-register')

module.exports={
    pagination:function paginatedResults(model){
        console.log(model);
        return async (req,res,next)=>{
            const page=parseInt(req.query.page);
            const limit=parseInt(req.query.limit);
            console.log(page);
            console.log(limit);
            const startIndex=(page-1)*limit;
            const endIndex=page*limit;
            const results={};
            if(endIndex < await model.countDocuments().exec()){
                results.next={
                    page:page+1,
                    limit:limit
                }
            }
            if(startIndex>0){
                results.previous={
                    page:page-1,
                    limit:limit
                }
            }
            try {
                results.results=await model.find().limit(limit).skip(startIndex).exec()
                req.paginatedResults=results;
                req.session.paginated=results;
                next()
            } catch (e) {
                res.status(500).json({message:e.message})
            }
        }
    }
}

