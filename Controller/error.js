const httpError=require('../Models/http-error')
const handleCastErrordb=err=>{
        // For mongoDb error like in nschema or invalud input or ID's
        const message=`Invalid ${err.path}: ${err.value}` 
    return new httpError(message,400)
}
const handleDuplicateFieldsdb=err=>{
        // For mongoDb error for handeling duplicate fields in mongoose like unique
        const value=err.errmsg.match(/(["'])(\\?.)*?\1/)
        const message=`Duplicate field value: ${value}. Please use another value` 
        return new httpError(message,400)
}
const handleValidationErrordb=err=>{
        // For mongoDb error for handeling mongoose validation error
        const errors=Object.values(err.errors).map(el=>el.message)
        const message=`Invalid Input Data. ${errors.join('. ')}` 
        return new httpError(message,400)
}
const sendErroDev=(err,res)=>{
    res.status(err.statusCode).json({
        status:err.status,
        error:err,
        message:err.message,
        stack:err.stack,
    })
}
const sendErroProd=(err,res)=>{
    //Operational Trusted Error: send message to clients
    // operational is because the error which is like programming error or third party pacjkage error so by default this.operational==false for that so we have this.operational=true for all kind of errors

    if(err.isOperational){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message
        })
        //Programming or other unknown error: don't leak error details
    }
    else{
        // Handle unoperation error like programming error
        //1) Log Error
        console.error("Error",err)

        //2) Send Generic Message
        res.status(500).json({
            status:"error",
            message:"Something went wrong"
        })
    }

}

module.exports=(err,req,res,next)=>{
    //console.log(err.stack)
    if(req.file){
        fs.unlink(req.file.path,(err)=>{
            console.log(err)
        })
    }
    if(res.headerSent){
        next(error)
    }
    err.statusCode=err.statusCode || 500;
    err.status=err.status || 'error';

    if(process.env.NODE_ENV=='development'){
        sendErroDev(err,res)
    }
    else if(process.env.NODE_ENV=='production'){
        let error={...err}
        // For mongoDb error like in nschema or invalud input or ID's
        if(error.name=="Cast Error"){
            error=handleCastErrordb(error)
        }
        // For mongoDb error for handeling duplicate errors
        if(error.code==1100){
            error=handleDuplicateFieldsdb(error)
        }
        // For mongoDb error for handeling mongoose validation error
        if(error.name=='ValidationError'){
            error=handleValidationErrordb(error)
        }
        sendErroProd(err,res)
    }
}