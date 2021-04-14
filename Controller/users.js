const uuid=require('uuid')
const httpError=require("../Models/http-error")
const Users=require("../Models/users")
const jwt=require('jsonwebtoken')
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
        jwt.sign({
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
exports.getAllUsers=getAllUsers
exports.signUp=signUp
exports.login=login
exports.forgotPassword=forgotPassword