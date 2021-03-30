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
    const {name,email,password}=req.body
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
    let hashedPassword;
    try{
        hashedPassword=await bcrypt.hash(password,12)
    }
    catch(err){
        const error= new httpError("Could not create user, seomething went wrong",500)
        return next(error) 
    }

    let result;
    try{
        const createdUser=await new Users({
            name,
            email,
            password:hashedPassword,
            image:`${req.file.path}`,
            places:[],
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
        data:{userId:result._id, email:result.email,token:token, images: result.image, places:result.places}
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
    let isValidPassword;
    try{
        isValidPassword=await bcrypt.compare(password, existingUser.password)
    }
    catch(err){
        const error=new httpError("Could not login, Please Input Password Again",500)
        return next(error)
    }
    if(!isValid){
        console.log("error")
        const error=new httpError("Invalid Password",500)
        return next(error)
    }
    let token;
    try{
        jwt.sign({
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
        data:{userId:result._id, email:result.email,token:token, images: result.image, places:result.places}
    })
}
exports.getAllUsers=getAllUsers
exports.signUp=signUp
exports.login=login