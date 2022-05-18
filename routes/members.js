var express = require('express');
var router = express.Router();
const Member = require('../src/models/member-register');
const bcrypt=require('bcryptjs');
const auth=require('../src/middleware/memberAuth')
const jwtMember = require('jsonwebtoken');
const controler=require('../src/controler/member-controler');
const memberControler=require('../src/controler/member-helper');
const {check,validationResult}=require('express-validator')
const store=require('../src/middleware/multer');
const Taskrouter = require('twilio/lib/rest/Taskrouter');

/* GET users listing. */
// router.get('/', controler.home)
//create a new member in database
router.post('/signup-guide',controler.signupGuidePost)
//member login check
router.post('/login-guide',[
    check('password','Password must be minimom of three letters')
    .exists()
    .isLength({min:3}),
    check('email','Email is not valid')
    .isEmail()
    .normalizeEmail()
],controler.loginGuidePost)
//member dashboard
router.get('/dashboard',auth,memberControler.dashboard)
router.get('/dashboard/add-post',auth,memberControler.addPost)
router.post('/dashboard/add-post',auth,memberControler.addPostPost)
router.get('/dashboard/upload-cover/:id',memberControler.uploadCover)
router.post('/dashboard/upload-cover/:id',store.array('images',1),memberControler.uploadCoverPost)

//logout page route
router.get('/logout',auth,controler.logout);
router.get('/edit-profile',auth,memberControler.editProfile);
router.post('/edit-profile/:id',memberControler.updateProfile);
router.get('/edit-pic',auth,memberControler.editPic);
router.post('/upload-profile/:id',store.array('images',1),memberControler.uploadProfile);
router.get('/edit-social',auth,memberControler.editSocial);
router.post('/edit-social/:id',memberControler.editSocialPost);
router.get('/dashboard/portfolio',auth,memberControler.portfolio);
router.post('/dashboard/portfolio/:id',store.array('images',12),memberControler.portfolioPost)
router.get('/dashboard/feedback',auth,memberControler.feedbackMember);
router.get('/dashboard/payments',auth,memberControler.payments)
router.get('/dashboard/messages',auth,memberControler.guideMessages)
// router.post('/messages',memberControler.messagesPost)


//posts
router.get('/edit-post/:id',auth,memberControler.editPost);
router.post('/dashboard/add-figure',auth,memberControler.amount)
router.post('/dashboard/bank-details',auth,memberControler.bankDetails)


module.exports = router;