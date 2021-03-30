const express= require("express");
const userRoutes=require('../Controller/users');
const {check}= require("express-validator");
const {fileUpload}=require('../midllewares/file-upload');

const route=express.Router();

route.get('/',userRoutes.getAllUsers)
route.post('/signup',
        fileUpload.single('image'),
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


module.exports=route