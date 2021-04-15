const uuid=require('uuid')
const httpError=require("../utils/http-error")
const crypto=require("crypto")
const Users=require("../Models/users")
const jwt=require('jsonwebtoken')
const sendEmail=require('../utils/email')
const bcrypt=require('bcryptjs')
const {validationResult}=require("express-validator")

const getAllUsers=async (req,res,next)=>{
    let users
    try{
        users=await Users.find({},'-password');
    }
    catch(err){
        const error=new httpError("Could Not Find Users",500)
        return next(error)
    }
    if(!users){
        const error=new httpError("No Users Found",500)
        return next(error)
    }
    res.status(200).json({
        message:"Successfully Found User",
        users:users
    })
}

const signUp=async (req,res,next)=>{
    const {name,email,password, passwordConfirm}=req.body
    console.log(name,email,password)
    let hasUser;
    try{
        hasUser=await Users.findOne({email:email})
    }
    catch(err){
        const error=new httpError("SignUpk Failed,Something went Wrong",500)
        return next(error)
    }
    if (hasUser){
        const error=new httpError("User Already Exist",422)
        return next(error)
    }
    // Encrypted Password is in the modal of user schema


    // let hashedPassword;
    // try{
    //     hashedPassword=await bcrypt.hash(password,12)
    // }
    // catch(err){
    //     const error= new httpError("Could not create user, seomething went wrong",500)
    //     return next(error) 
    // }

    let result;
    try{
        const createdUser=await new Users({
            name,
            email,
            password:password,
            passwordConfirm:passwordConfirm,
            photo:`${req.file.path}`,
        })
        result=await createdUser.save();
    }
    catch(err){
        const error=new httpError("SignUp Failed,Something went Wrong",500)
        return next(error)
    }

    let token;
    try{
        token=jwt.sign({
            userId:result._id,
            email:result.email
        },
        "huzaifa_secret_key",
        {
            expiresIn:'1h'
        }
        )
    }
    catch(err){
         const error=new httpError("Signing Up failed, Please Try Again Later")
         return next(error)
    }

    res.status(200).json({
        message:"User Created Successfully",
        data:{userId:result._id, email:result.email,token:token, photo: result.photo}
    })
}

const login=async (req,res,next)=>{
    const {email,password}=req.body
    const error=validationResult(req)
    if(!error){
        console.log("error")
        const error=new httpError("Input the Correct Fields",400)
        return next(error)
    }
    let existingUser;
    try{
        existingUser=await Users.findOne({email:email})
    }
    catch(err){
        console.log("error")
        const error=new httpError("Logging In Failed, Please Try Again Later",500)
        return next(error)
    }
    if(!existingUser){
        console.log("error")
        const error=new httpError("User Doesn't Exist",500)
        return next(error)
    }
    // try{
        //     isValidPassword=await bcrypt.compare(password, existingUser.password)
        // }
        // catch(err){
            //     const error=new httpError("Could not login, Please Input Password Again",500)
            //     return next(error)
            // }
    // We confirm the password on Model of User by build the mongoose function see in the userSchemema file
    let isValidPassword=existingUser.correctPassword(password,existingUser.password)
    if(!isValidPassword){
        console.log("error")
        const error=new httpError("Invalid Password",500)
        return next(error)
    }
    let token;
    try{
        token=jwt.sign({
            userId:existingUser._id,
            email:existingUser.email
        },
        "huzaifa_secret_key",
        {
            expiresIn:'1h'
        }
        )
    }
    catch(err){
         const error=new httpError("Signing Up failed, Please Try Again Later")
         return next(error)
    }
    res.status(200).json({
        message:"LoggedIn Successfully",
        data:{userId:existingUser._id, email:existingUser.email,token:token, images: existingUser.image}
    })
}
const forgotPassword=async (req,res,next)=>{
    const {email}=req.body
    const error=validationResult(req)
    if(!error){
        console.log("error")
        const error=new httpError("Email must Required",400)
        return next(error)
    }

    //1) get user based on Posted email
    const user=await Users.findOne({email:email})
    if(!user){
        const error=new httpError("There is no User with this email address",400)
        return next(error)
    }

    //2) Generate te random reset token

    //createPasswordRestriction is in the user schema
    const resetToken=user.createPasswordRestriction();
    //validateBeforeSave this is for when we save so by default it check all the required field fron sceme but in create reset token we only need email
    await user.save({validateBeforeSave:false})

    //3) Send it to user's email
    //req.protol and req,get is by bydefault in the req
    const resetUrl=`${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`
    const message=`Forgot your password? Submit a PATCH request with your new password and password confirm to: ${resetUrl}. \nIf you didn't forget your password, please ignore this email!`
    try{

        await sendEmail({
            email:user.email,
            subject:'Your password reset token (valid for 10 min)',
            message
        })
        res.status(200).json({
            status:'success',
            message :'token sent to email!'
        })
    }
    catch(err){
        user.passwordResetToken=undefined
        user.passwordResetExpires=undefined
        await user.save({validationBeforeSave:false})
        const error=new httpError("There was an error sending th email. Try again later!",500)
         return next(error)
    }
}
const resetPassword=async (req, res, next)=>{
    const error=validationResult(req)
    if(!error){
        console.log("error")
        const error=new httpError("Wrong Credentials",400)
        return next(error)
    }
    //1) Get user based on the token
    const hashedToken=crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

    const user=await Users.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpires:{$gt:Date.now()}
    })
     
    //2) If token has not expired, and there is user, set the new password
    if(!user){
        const error=new httpError("Token is invalid or has expired",500)
         return next(error)
    }
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    await user.save();
    //3) Update changePasswordAt property for the user
    // this is in the user schema file
    //4) Log the user in, send JWT
    let token;
    try{
        token=jwt.sign({
            userId:result._id,
            email:result.email
        },
        "huzaifa_secret_key",
        {
            expiresIn:'1h'
        }
        )
    }
    catch(err){
         const error=new httpError("Reset Password Failed, Please Try Again Later")
         return next(error)
    }
    res.status(200)
    .json({
        status:'success',
        token
    })
}

// For logged in users to change his password not for forgot password
const updatePassword=async (req,res,next)=>{
    const error=validationResult(req)
    if(!error){
        console.log("error")
        const error=new httpError("Wrong Credentials",400)
        return next(error)
    }
    //1) get user from collection
    //req.user.id is get from th protected check-auth route
    const user= Users.findById(req.user.id).select('-password');

    //2) check if POSTed current password is correct
    if(!await user.correctPassword(req.body.passwordCurrent,user.password)){
        const error=new httpError("Your current password is wrong",401)
         return next(error)
    }

    //3) if so, update password
    user.password=req.body.password
    user.passwordConfirm=req.body.passwordConfirm
    await user.save()
    //4) Log user in send JWT
    let token;
    try{
        token=jwt.sign({
            userId:result._id,
            email:result.email
        },
        "huzaifa_secret_key",
        {
            expiresIn:'1h'
        }
        )
    }
    catch(err){
         const error=new httpError("Reset Password Failed, Please Try Again Later")
         return next(error)
    }
    res.status(200)
    .json({
        status:'success',
        token
    })
}
exports.getAllUsers=getAllUsers
exports.signUp=signUp
exports.login=login
exports.forgotPassword=forgotPassword
exports.resetPassword=resetPassword
exports.updatePassword=updatePassword