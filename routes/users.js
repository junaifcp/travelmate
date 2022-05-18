var express = require('express');
var router = express.Router();
require('../src/db/conn');
const User=require('../src/models/user-register');
const Member=require('../src/models/member-register')
const bcrypt=require('bcryptjs');
const auth = require('../src/middleware/userAuth');
const app = require('../app');
const controler=require('../src/controler/user-controler');
const otpControler=require('../src/controler/userOtpControler');
const memberControler=require('../src/controler/member-helper');
const store=require('../src/middleware/multer');
const parseUrl=express.urlencoded({extended:false})
const parseJson=express.json({extended:false})
const {check,validationResult}=require('express-validator')
// loading posts for pagination
const Post=require('../src/models/post')
const page=require('../src/middleware/pagination')
/* GET home page. */
router.get('/',auth,controler.home);
router.get('/show-all-members',auth,controler.showAllMembers);
router.post('/show-all-members',auth,controler.showAllMembersPost);
router.get('/loginMain',auth,controler.loginMain);
//login check
router.post('/login',[
    check('username','User name is not valid')
    .exists()
    .isLength({min:3}),
    check('password','password must be 3 letters')
    .exists()
    .isLength({min:3})
],controler.loginPost);
 router.get('/signup',controler.signupPost);
//create a new user in our database
router.post('/signup',controler.signupUser);
router.get('/logout',auth,controler.logout);
router.get('/mobile',otpControler.mobile);
router.post('/mobile',otpControler.numberPost);
router.post('/mobile/verify',controler.verify);
router.get('/member/:id',auth,memberControler.viewProfile);
router.post('/member/feedback/:id',auth,memberControler.feedback);
router.get('/get-my-time/:id',auth,memberControler.getMyTime);
router.post('/get-my-time/:id',auth,memberControler.getMyTimePost);
router.post('/get-the-time',auth,memberControler.getTheTime)
router.post('/verify-payment',auth,memberControler.verifyPayment);
router.get('/send-email',auth,memberControler.sendEmail);
router.get('/send-guide-email',auth,memberControler.sendGuideEmail);
router.get('/accept',memberControler.accept);
router.get('/reject',memberControler.reject);
router.get('/get-the-time-later',auth,memberControler.getTheTimeLater)
router.post('/pay-for-time/:id',[auth,parseUrl,parseJson],memberControler.payForTime);
router.post('/callback',memberControler.callBack)
//user dashboard routes

router.get('/dashboard',auth,controler.dashboard);
router.get('/dashboard/edit-pic',auth,controler.editPic);
router.post('/dashboard/upload-pic/:id',store.array('images',1),controler.uploadPic);
router.get('/dashboard/edit-profile',auth,controler.editProfile);
router.post('/dashboard/edit-profile',auth,controler.editProfilePost);
router.post('/dashboard/add-wishlist',auth,controler.addWishlist);
router.get('/dashboard/delete-wish/:id',auth,controler.deleteWish);
router.get('/dashboard/find-guide',auth,controler.findGuide);


//landing pages route

router.get('/about',auth,controler.about);
router.get('/destination',auth,controler.destination);
router.get('/destination-single/:id',auth,controler.destinationSingle);
router.get('/destination-full/:id',auth,controler.destinationFull);
router.get('/hotel',auth,controler.hotel);
router.get('/blog',auth,controler.blog);
router.get('/contact',auth,controler.contact);
router.get('/blog-single/:id',auth,controler.blogSingle);

router.post('/contact',auth,[
    check('name','Name must be minimom of three letters')
    .exists()
    .isLength({min:3}),
    check('email','Email is not valid')
    .isEmail()
    .normalizeEmail()
],controler.contactPost);
router.post('/hotel',auth,controler.destinationPost)
router.get('/hotel-single/:id',auth,controler.hotelSingle)
router.get('/contact/:id',auth,memberControler.contactProfile)
router.post('/contact/:id',auth,memberControler.contactProfilePost)

//password reset
router.get('/password-reset',controler.passwordReset)
router.post('/password-reset',controler.PasswordResetPost)
router.get('/password-set/:id/:token',controler.passwordSet)
router.post('/password-set/:id/:token',controler.passwordSetPost)
module.exports = router;
