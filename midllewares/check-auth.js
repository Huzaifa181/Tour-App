const httpError=require('../utils/http-error');
const User=require('../Models/users');
const jwt=require('jsonwebtoken');
const {promisify}=require('util');

module.exports=async (req, res, err)=>{
    if(req.method=="OPTION"){
        return next();
    }
    // 1) Getting token and check of its there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token=req.header.authorization.split(" ")[1];
    }
    if(!token){
        const error=new httpError("Authentication Failed",401);
        return next(error)
    }
    //2) Verification Token
    const decoded=await promisify(jwt.verify)(token,'huzaifa_secret_key');

    //3) Check if User Still Exist like someOne stolen the web token and user change his password and what if we delete the user so token should not be valid
    const freshUser=await User.findById(decoded.id)
    if(!freshUser){
        return next(
            new httpError("The user belong to this token does no longer exist",401)
        )
    }

    //4) Check if User changed password after the token was issued
    //iat means issued At
    //changePasswordAfter function is in the user Schema
    if(freshUser.changePasswordAfter(decoded.iat)){
        return next(
            new httpError("User recently change password. Please login again",401)
        )
    }
    //5) Grant access to protected Routes
    req.user=freshUser
    next()
}