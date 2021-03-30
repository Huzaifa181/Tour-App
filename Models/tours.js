// const { truncate } = require('fs/promises')
const mongoose =require('mongoose')
tourSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
       trim:true
    },
    duration:{
        type:String,
        required:[true, 'A tour must have duration'],
        unique:true
    },
    maxGroupSize:{
        type:Number,
        required:[true, 'A tour must have a group size'],
    },
    difficulty:{
        type:Number,
        required:[true, 'A tour must have a difficulty'],
    },
    ratingAverage:{
        type:Number,
        default:4.5
    },
    ratingQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,"A tour must have a price"]
    },
    priceDiscount:{
        type:Number,  
    },
    summary:{
        type:String,  
        trim:true,
        required:[true,'A tour must have a summary']
    },
    description:{
        type:String,  
        trim:true,
    },
    imageCover:{
        type:String,  
        required:[true, 'A tour must have a image cover']
    },
    images:{
        type:[String], 
    },
    createdAt:{
        type:Date,
        default:Date.now() 
    },
    createdAt:{
        type:Date,
        default:Date.now() 
    },
    startDates:{
        type:[Date],
    },
})


module.exports=mongoose.model("tours",tourSchema)