const Reviews=require('../Models/reviews')
const httpError=require("../utils/http-error")
const mongoose=require('mongoose')

const getAllReviews=async (req,res,next)=>{
    let reviews;
    try{
        reviews=await Reviews.find()
    }
    catch(err){
        const error=new httpError("Fatching Reviews Failed, Could not find Review",401)
        return next(error)
    }
    if(!reviews || reviews.length==0){
        const error=new httpError("No Reviews Found May be Create One",401)
        return next(error)
    }
    res.status(200).json({
        status:'success',
        results:reviews.length,
        data:{
            reviews
        }
    })
    next()
}
const createReview=async (req,res,next)=>{
    let createReview
    try{
        createReview=new Reviews(req.body)
    }
    catch(err){
        res.status(400).json({
            status:'fail',
            message:'Invalid Data Sent'
        })
    }
    res.status(201)
    res.json({
        status:'success',
        message:'Review Created Successfully',
        data:{
            review:createReview
        }
    })
    next()
}

exports.getAllReviews=getAllReviews
exports.createReview=createReview