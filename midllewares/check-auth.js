const httpError=require('../Models/http-error');
const jwt=require('jsonwebtoken');

module.exports=(req, res, err)=>{
    if(req.method=="OPTION"){
        return next();
    }
    const token=req.header.authorization.split(" ")[1];
    try{
        if(!token){
            const error=new httpError("Authentication Failed",401);
            return next(error)
        }
        const decodedToken= jwt.verify(token,'huzaifa_secret_key');
        req.userData={userId:decodedToken.userId}
        next()
    }
    catch(err){
        const error=new httpError("Authentication Failed",401);
        return next(error)
    }
}