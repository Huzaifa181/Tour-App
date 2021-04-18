const mongoose =require('mongoose')
const User =require('./users')
const validator =require('validator')
reviewSchema=new mongoose.Schema({
    review:{
        type:String,
        required:[true,"Review can not be empty"]
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'tours',
        required:[true,"Review must belong to a Tour"]
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'users',
        required:[true,"Review must belong to a User"]
    },
},
{
    // It means every time we send ther data to JSON or object so it shows the vitual properties in the response
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
})

//For populate user and tour
reviewSchema.pre(/^find/,function(next){
    this.populate({
        path:'tour',
        select:'name'
    }).populate({
        path:'user',
        select:'name photo'
    })
})

module.exports=mongoose.model("Review",reviewSchema)