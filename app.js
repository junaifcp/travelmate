require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session=require('express-session');
const qs = require("querystring");
const cors=require('cors');
const methodOverride = require('method-override');
var helpers = require('handlebars-helpers')();
const nodemailer=require('nodemailer')
const auth=require('./src/middleware/userAuth')

// loading posts for pagination
// instance of razorpay



const bodyparser = require('body-parser')
// require('./src/db/conn')();
// const User=require('./src/models/user-register')
const hbs=require('hbs');

const categoryRouter=require('./routes/categories')
const destCategoriesRouter=require('./routes/destCategories')
var postRouter = require('./routes/posts')
var destinationRouter = require('./routes/destinations')
var adminRouter = require('./routes/admin')
var membersRouter = require('./routes/members');
var usersRouter = require('./routes/users');
const { data } = require('jquery');
// var rootRouter = require('./routes/root')

  
var app = express();        
app.use(cors())
//public folders path
// const publicPath = path.join(__dirname,"/public");
// const imagesPath = path.join(__dirname,"/public/images");
// const siteImages = path.join(__dirname,"/public/images/site-images")

var handlebars = require('express-handlebars').create({
  layoutsDir: path.join(__dirname, "views/layouts"),
  partialsDir: path.join(__dirname, "views/partials"),
  defaultLayout: 'layout',
  extname: 'hbs',
  helpers:{
     ifCond:(v1,v2,options)=>{
      if(v1 === v2) {
        return options.fn(this);
      }
      return options.inverse(this);
     },
     toJSON : function(object) {
      return JSON.stringify(object);
    },
    date:function(date) {
      var d = new Date(date),
              month = '' + (d.getMonth() + 1),
              day = '' + d.getDate(),
              year = d.getFullYear();
      
      if (month.length < 2)
          month = '0' + month;
      if (day.length < 2)
          day = '0' + day;
      var date = new Date();
      date.toLocaleDateString();
      
      return [day, month, year].join('-');
      },
      day:function(date) {
        var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();
        
        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;
        var date = new Date();
        date.toLocaleDateString();
        return [day].join('-');
        },
        month:function(date) {
          var d = new Date(date),
                  month = '' + (d.getMonth()),
                  day = '' + d.getDate(),
                  year = d.getFullYear();
          
          if (month.length < 2)
              month = '0' + month;
          if (day.length < 2)
              day = '0' + day;
          var date = new Date();
          date.toLocaleDateString();
          const months =["January","February","March","April","May","June","July","August","September","October","November","December"];
          return months[parseInt(month)];
          },
          year:function(date) {
            var d = new Date(date),
                    month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();
            
            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;
            var date = new Date();
            date.toLocaleDateString();
            return [year];
            },
         feedCount:function(inputs) {
          let counter = 0;
          for (let i = 0; i < inputs.length; i++) {
             counter++;
          }
          return counter;
        },
        slice:function(string){
          let result = string.slice(0, 100);
          console.log(result);
          return result
        },
        postSlice:function(string){
          let result = string.slice(0, 130);
          console.log(result);
          return result
        },
        eachProperty:function(context, options) {
          var ret = "";
          for(var prop in context)
          {
              ret = ret + options.fn({property:prop,value:context[prop]});
          }
          return ret;
      },
      times:function(n, block) {
        var accum = '';
        for(var i = 1; i <= n; ++i)
            accum += block.fn(i);
        return accum;
    },
    counter:(index)=>{
      return index+1
    },
    price:(price)=>{
      // const amount=price.product_price_breakdowns.gross_amount_per_night.value
      return parseInt(price)
    },
    km:(distance)=>{
      return (distance/1000).toFixed(1)
    },
    images:(photo)=>{
      let len=photo.length;
      
    }
   
  }
 
  
  
});
//database
require('./src/db/conn')();

// view engine setup
app.engine('hbs',handlebars.engine)
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'hbs');

//register partials
// const partials_path=path.join(__dirname,"./templates/partials")
// hbs.registerPartials(partials_path)
app.use(session({
  secret: "secret_key",
  cookie:{maxAge:6000000},
  resave:false,
  saveUninitialized:true
}))

app.use(methodOverride('_method'));

app.use(logger('dev'));
app.use(express.json());
// Body-parser middleware
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('uploads',express.static(path.join(__dirname,'uploads')))
// app.use(express.static(imagesPath))
// app.use(express.static(siteImages))
app.use('/api/destCategories',destCategoriesRouter)
app.use('/api/destinations',destinationRouter)
app.use('/api/categories',categoryRouter)
app.use('/api/posts',postRouter)
app.use('/admin',adminRouter)
app.use('/members', membersRouter);
app.use('/', usersRouter)
// app.use('/', rootRouter);
app.use('*',auth,(req,res)=>{
  const admin=req.cookies.adminToken;
  const user=req.cookies.jwt;
  const guide=req.cookies.memberLoginJwt;
  if(user){
   res.redirect('/dashboard')
  }else if(guide){
    res.redirect('/members/dashboard')
  }else if(admin){
     res.redirect('/admin/dashboard')
  }else{

    res.render('404',{error:true})
  }
})
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
