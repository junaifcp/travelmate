var express = require('express');
var router = express.Router();
const controler=require('../src/controler/admin-controler')
const auth = require('../src/middleware/memberAuth');

router.get('/',controler.admin);
router.post('/login',controler.login);
router.get('/admin-logout',controler.logout);
router.get('/dashboard',auth,controler.dashboard);
router.get('/dashboard/delete-user/:id',controler.deleteUser);
router.get('/dashboard/block-user/:id',controler.blockUser);
router.get('/tourists-all',auth,controler.touristsAll);
router.get('/guides-all',auth,controler.guidesAll);
router.get('/posts-all',auth,controler.postsAll);
router.get('/payments-all',auth,controler.paymentsAll);
router.get('/destination',auth,controler.destination);
// router.get('/dashboard/unblock-user/:id',controler.blockUser);
module.exports = router;