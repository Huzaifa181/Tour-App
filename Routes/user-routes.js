const express= require("express");
const userRoutes=require('../Controller/users');
const checkAuth=require('../midllewares/check-auth');
const {resizeUserPhoto}=require('../midllewares/resizeUserPhoto');
const {check}= require("express-validator");
const {fileUpload}=require('../midllewares/file-upload');

const route=express.Router();

route.get('/',userRoutes.getAllUsers)

route.post('/signup',
        [
            check('name').
            not().
            isEmpty(),
            check('email').
            normalizeEmail().
            isEmail(),
            check('password').
            not().
            isEmpty()
        ],userRoutes.signUp)

route.post('/login',
[
    check('email').
    isEmail(),
    check('password').
    not().
    isEmpty(),
],userRoutes.login)

route.post('/forgotPassword',
[
    check('email').
    isEmail(),
],userRoutes.forgotPassword)

route.patch('/resetPassword/:token',[
    check('password').
    not().
    isEmpty(),
    check('passwordConfirm').
    not().
    isEmpty(),
],userRoutes.resetPassword)

route.use(checkAuth);

route.patch('/resetPassword/:token',[
    check('passwordCurrent').
    not().
    isEmpty(),
    check('password').
    not().
    isEmpty(),
    check('passwordConfirm').
    not().
    isEmpty(),
],userRoutes.updatePassword)

route.get('/me',fileUpload.single('photo'),resizeUserPhoto,userRoutes.updateMe)
route.patch('/updateMe',fileUpload.single('photo'),userRoutes.updateMe)
route.delete('/deleteMe',userRoutes.deleteMe)

module.exports=route