const mongoose =require('mongoose')
const crypto =require('crypto')
const uniqueValidator=require('mongoose-unique-validator')
const bcrypt=require('bcryptjs')
const validator =require('validator')
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please tell us Your Name"]
    },
    email:{
        type:String,
        required:[true, "Please provide your email"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,"Please provide a valid email"]
    },
    photo:String,
    password:{
        type:String,
        required:[true,"Please provide a Password"],
        minlength:8
    },
    passwordConfirm:{
        type:String,
        required:[true,"Please confirm a Password"],
        validate:{
            //This only work for create or save()
            validator:function(el){
                return el===this.password
            }
        },
        message:"Password are not the same!"
    },
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})

userSchema.plugin(uniqueValidator)
//Document middleware(pre): runs before.save() and .create() not for insertMany or etc
userSchema.pre('save', async function(next){
    //Only run this function if password was actually modified
    if(!this.isModified('password')) return next();

    //Hash the password with cost of 12
    this.password=await bcrypt.hash(this.password,12)

    //Delete Password Confirm Field
    this.passwordConfirm=undefined;
    next()
})

//for changing passwordChangeAt property see in the resetPassword route
userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next()
    //-1000 is the small hack for if some time give error in reset password for 1 second
    this.passwordChangedAt=Date.now()-1000
})

//Show User which has property active:true
userSchema.pre('/^find/',function(next){
    //this points to the current query
    this.find({active:{$ne:false}})
    next();
})

//Compare Hash Password from db with the user Input Password
userSchema.methods.correctPassword=async function(
    candidatePassword,
    userPassword
){
    return await bcrypt.compare(candidatePassword,userPassword)
}

// For Check if the user Change his password... For invalid the jwt token see in check-auth file in middlewares
userSchema.methods.changePasswordAfter=function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimeStamp=parseInt(
            this.passwordChangedAt.getTime()/1000,10
        ) 
        return JWTTimestamp < changedTimeStamp
    }

    //False means Password not Changed
    return false
}

// For Creating the password reset token when user click on the forgot password check in the forgot password route so that we send the token to email of the user
// see in the forgot password route
userSchema.methods.createPasswordRestriction=function(JWTTimestamp){
    const resetToken=crypto.randomBytes(32).toString('hex');
    this.passwordResetToken=crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
    this.passwordResetExpires=Date.now()+10*60*1000
    return resetToken
}
module.exports=mongoose.model("users",userSchema)