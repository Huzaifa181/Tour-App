// const { truncate } = require('fs/promises')
const slugify=require('slugify')
const mongoose =require('mongoose')
const User =require('./users')
const validator =require('validator')
tourSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
       trim:true,
       maxlength:[40,'A name must have 40 charcter or less'],
       minlength:[2,'A name must have 2 charcter or more'],
    //    validator:[validator.isAlpha,"Tour Name must only ontain alphabets"]
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
        enum:{
            values:['easy','difficult','hard'],
            message:'Difficulty is either easy, medium and hard'
        }
    },
    ratingAverage:{
        type:Number,
        default:4.5,
        //min and max is also use for dates
        max:[1,"A rating average must greater than 1.0"],
        min:[1,"A rating average must less than 5.0"],
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
        // This pnly work for new User or save not run on update
        validate:{
            validator:function(val){
                // this only point to current doc on NEW document creation 
                return val<this.price
            },
            message:`Discount price ({VALUE}) should be below regular price`

        }
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
    slug:String,
    secretTour:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now() 
    },
    startDates:{
        type:[Date],
    },
    startLocation:{
        //GeoJSON data first latitude and then longitude
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    //For embeded/denormalized User means save document not just Id
    
    // I comment this code because this is the example of teh embedded document that we embed the guide array to tour document but we have to do it as refrencing for better approach

    // guides:Array,

    // For noramization or refrencing
    guides:[
        {
            type:mongoose.Schema.ObjectId,
             ref:'User'
        }
    ],
    locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:[Number],
        address:String,
        description:String,
        day:Number
        }
    ],

    // we do this below in virtualPopulate below
    // reviews:[
    //     {
    //         type:mongoose.Schema.ObjectId,
    //         ref:'Review'
    //     }
    // ]
},{
    // It means every time we send ther data to JSON or object so it shows the vitual properties in the response
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
})

//Indexing
tourSchema.index({price:1,ratingAverage:-1})
tourSchema.index({slug:1})

//virtual property means make the field by calculation of the other field
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7
})

//Virtual Populate (means while doing parent refrencing between tour and review schema so we implented the objectId of tour in review shema and then we have to reference the revie in tour schema in order to know about reviews of the tour so we are doing virtual populate that instead of the array of reviews d in tour schema we do virtual populate)
tourSchema.virtual('reviews',{
    ref:'Review', //Foreign Schema name
    foreignField:'tour', // Foreign field of Foreign Schema
    localField:'_id' // store the _id in foreign field of Foreign Schema
})

// There are four types of mongoose middleware document, query, aggregate and model
//Document middleware(pre): runs before.save() and .create() not for insertMany or etc
tourSchema.pre('save',function(next){
    this.slug=slugify(this.name,{lower:true})
    next()
})

// I comment this code because this is the example of teh embedded document that we embed the guide array to tour document but we have to do it as refrencing for better approach

//For embeded/denormalized User means save document not just Id
// this only works on save document
// tourSchema.pre('save',function(next){
//     const guidePromises=this.guides.map(async id=>await User.findById(id));
//     this.guides=await Promise.all(guidePromises)
//     next()
// })

// I comment this code because this is the example of teh embedded document that we embed the guide array to tour document but we have to do it as refrencing for better approach

//For embeded/denormalized User means save document not just Id
// this only works on find document
// tourSchema.pre(/^find/,function(next){
//     const guidePromises=this.guides.map(async id=>await User.findById(id));
//     this.guides=await Promise.all(guidePromises)
//     next()
// })

tourSchema.pre('save',function(next){
    console.log("Will save Document")
    next()
})
//Document middleware(post): runs after.save(),.remove() and .create() not for insertMany or etc
// But we have to specify in the function like tourSchema.post('remove',function(doc,next){
tourSchema.post('save',function(doc,next){
    console.log(doc)
    next()
})
//Query middleware(pre): runs before for .find(), .findById(), findOne(), count, deleteOne, deleteMany, all starts with find, remove,  update, updateOne, and updateMany and etc
// tourSchema.pre('find',function(next){

//Query middleware(pre): runs before for .find(),.findById() and etc
tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}})
    next()
})
//Query middleware(post): runs after only for .find(),.findById() and etc
tourSchema.post(/^find/,function(doc,next){
    console.log(doc)
    next()
})

//Aggregation middleware(post): runs after only for .find(),.findById() and etc
tourSchema.pre('aggregate',function(next){
    this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
    next()
})
module.exports=mongoose.model("tours",tourSchema)