class httpError extends Error{
    constructor(message,errorCode){
        super(message);
        this.code=errorCode;
        // operational is because the error which is like programming error or third party pacjkage error so by default this.operational==false for that so we have this.operational=true for all kind of errors
        this.operational=true
        // When a new object is created, constructor func is called, then that func call is not gonna appear in the stack trace and it will pollute it
        Error.captureStackTrace(this,this.constructor)
    }
}

module.exports=httpError