const mongoose =require('mongoose')
const User =require('./users')
const Tour =require('./tours')
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

// combination of user and tour must be unique means one tour has only one review for particular user
reviewSchema.index({tour:1,user:1},{unique:true})

// For calculate avrage rating of the reviews
reviewSchema.statics.calculateAverage=async (tourID)=>{
    const stats=await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}
            }
        }
    ])
    if(stats.length>0){
        await Tour.findByIdAndUpdate(tourID,{
            ratingsQuantity:stats[0].nRating,
            ratingsAverage:stats[0].avgRating,
        })
    }
    else{
        await Tour.findByIdAndUpdate(tourID,{
            ratingsQuantity:0,
            ratingsAverage:4.5,
        })
    }
}

//To calculate average each time save the doc
reviewSchema.post('save',function(){
    // this.constructor points to the current modal as (Review) schema
    this.constructor.calculateAverage(this.tour);
    
})

//To calculate average each time findByIdAndUpdate and findByIdAndDelete
reviewSchema.pre(/^findOneAnd/,async function(next){
    // we do this in pre middle ware beance query middle dont have access the current doc in post middleware and we have to calculate average after saving the document means in post middleware
    this.r=await this.findOne();
    console.log(this.r)
    next()
})
reviewSchema.post(/^findOneAnd/,async function(next){
    //this.findOne() does not work here, query has already executed
    // we are also pass the doc to th post document by (r) variable   
    await this.r.constructor.calculateAverage(this.r.tour)
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