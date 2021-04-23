const Reviews=require('../Models/reviews')
const httpError=require("../utils/http-error")
const mongoose=require('mongoose')

const getAllReviews=async (req,res,next)=>{
    // To get particualar review via tour
    let filter={}
    if(req.params.tourId) filter={tour:req.params.tourId}
    let reviews;
    try{
        reviews=await Reviews.find(filter)
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
    //Allow nested routes
    if(!req.body.tour) req.body.tour=req.params.tourId
    if(!req.body.user) req.body.user=req.user.id

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
const deleteReview=async (req,res,next)=>{
    const pid=req.params.pid
    var review;
    try{
        review=await Reviews.findByIdAndDelete(pid)
        res.status(200).json({
            status:'success',
            data:null
        })
    }
    catch(err){
        const error=new httpError("Error in Deleting Review",400)
        return next(error)
    }
}
const updateParticularReview=async (req,res,next)=>{
    let review
    try{
        review=await Reviews.findOneAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
        res.status(200).json({
            status:'success',
            review
        })
    }
    catch(err){
        res.status(200).json({
            status:'fail',
            message:err
        })
    }
}
const updateReview=async (req,res,next)=>{
    let review
    try{
        tour=await Reviews.findOneAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
        res.status(200).json({
            status:'success',
            review
        })
    }
    catch(err){
        res.status(200).json({
            status:'fail',
            message:err 
        })
    }
}
exports.getAllReviews=getAllReviews
exports.createReview=createReview
exports.deleteReview=deleteReview
exports.updateReview=updateReview