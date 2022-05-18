const mongoose=require('mongoose');
// var md = require('markdown-it')();
const marked=require('marked');
const slugify=require('slugify')
const createDOMPurify=require('dompurify');
const mongoosePaginate=require('mongoose-paginate-v2');
const {JSDOM}=require('jsdom');
const DOMPurify=createDOMPurify(new JSDOM().window);
const PostSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    desc:{
        type:String,
        required:true,
    },
    userId:{
        type:String
    },
    markdown:{
        type:String,
        required:true
    },
    sanitizedHtml:{
        type:String,
       
    },
    photo:{
        type:String,
       required:false
    },
    username:{
        type:String,
        required:true
    },
    categories:{
        type:Array,
         required:false,
    }},
    {timestamps:true}
    );
    PostSchema.plugin(mongoosePaginate);
    PostSchema.pre('save',function(next){
       
        if(this.markdown){
       
            this.sanitizedHtml=DOMPurify.sanitize(marked.parse(this.markdown))
  
        }
        next()
    })

module.exports=mongoose.model("Post",PostSchema);