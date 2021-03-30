const httpError=require("../Models/http-error")
const Tour=require('../Models/tours')
const {validationResult}=require("express-validator")
const User=require('../Models/users')
const fs=require('fs')
const mongoose=require('mongoose')

const getTourByUser=async (req,res,next)=>{
    const id=req.params.uid
    let identifiedTour;
    try{
        identifiedTour=await Tour.find({creator:id})
    }
    catch(err){
        const error=new httpError("Fatching TOurs Failed, Could not find Tour",401)
        return next(error)
    }
    if(!identifiedTour || identifiedTour.length==0){
        const error=new httpError("No Tours Found May be Create One",401)
        return next(error)
    }
    res.status(200).json({
        tour:identifiedtour.map(tour=>tour.toObject({getters:true}))
    })
}

const getParticularTour=async (req,res,next)=>{
    const id=req.params.pid
    let identifiedTour;
    try{
        identifiedTour=await Tour.findById(id)
    }
    catch(err){
        const error=new httpError("Something went wrong, Could not Find Tour",500)
        return next(error)
    }
    if(!identifiedTour){
        const error=new httpError("Could not Find Tour fro the particular id",404)
        return next(error)
    }
    res.status(200).json({
        tour:identifiedTour.toObject({getters:true})
    })
}

const getAllTours=async (req,res,next)=>{
    let data
    try{
        data=await Tour.find().exec();
    }
    catch(err){
        const error=new httpError("Could not Find Tours",500)
        return next(error)
    }
    if(data.length==0){
        const error=new httpError("No Tour",201)
        return next(error)
    }
    res.status(201)
    res.json({
        message:"Successful",
        data:data
    })
}

const createTour=async (req,res,next)=>{
    // const error=validationResult(req)
    // const {title,description,image,address,location}=req.body
    // if(!error.isEmpty()){
    //     const error= new httpError("Invalid Input Passed, Please Check your Data",422)
    //     return next(error)
    // }
    let createTour
    try{
        createTour=new Tour(req.body)
    }
    catch(err){
        res.status(400).json({
            status:'fail',
            message:'Invalid Data Sent'
        })
    }
    // let user
    // try{
    //     user=await User.findById(req.userData.userId)
    // }
    // catch(err){
    //     console.log(err)
    //     const error= new httpError("Creating Tour Failed, Please Try again later",500)
    //     return next(error)
    // }
    // if(!user){
    //     const error= new httpError("Could Found User for That ID",500)
    //     return next(error)
    // }
    // try{
    //     const sess=await mongoose.startSession();
    //     await sess.startTransaction();
    //     await createTour.save({session:sess});
    //     user.tours.push(createTour);
    //     await user.save({session:sess});
    //     sess.commitTransaction();
    // }
    // catch (err){
    //     console.log(err)
    //     const error=new httpError("Created Placess failed, Please Try Again Later",500)
    //     return next(error)
    // }
    res.status(200)
    res.json({
        message:'Tour Created Successfully',
        data:createTour
    })
}
const updateParticularTour=async (req,res,next)=>{
    const {title, description}=req.body
    const error=validationResult(req)
    if(!error.isEmpty()){
        const error= new httpError("Invalid Input Passed, Please Check your Data",422)
        return next(error)
    }
    const pid=req.params.pid
    let tour;
    try{
        tour=await Tour.findById(pid)
    }
    catch(err){
        const error=new httpError("Could not Find Tours",500)
        return next(error)
    }
    tour.title=title
    tour.description=description
    if(req.userData.userId!=tour.creator.toString()){
        const error=new httpError("You cannot Update this tour",401)
        return next(error)
    }
    try{
        console.log(tour);
        tour=await tour.save();
    }
    catch(err){
        console.log(err)
        const error=new httpError("Something went wrong, Could not Update tour",500)
        return next(error)
    }
    res.status(200).json({
        message:"Updated Successfully",
        tour:tour.toObject({getters:true})
    })
}
const deleteParticularTour=async (req,res,next)=>{
    const pid=req.params.pid
    let tour;
    try{
        tour=await Tour.findById(pid).populate('creator')
    }
    catch(err){
        const error=new httpError("Error in Deleting a Tour",500)
        return next(error)
    }
    if(!tour){
        const error=new httpError("Could not Find Tours",500)
        return next(error)
    }
    const imagePath=tour.image
    if(req.userData.userId!=tour.creator.id){
        const error=new httpError("You cannot Delete this tour",401)
        return next(error)
    }
    try{
        console.log(tour);
        const sess=await mongoose.startSession();
        await sess.startTransaction();
        await tour.remove({session:sess});
        tour.creator.tours.pull(tour);
        await tour.creator.save({session:sess});
        await sess.commitTransaction();
    }
    catch(err){
        console.log(err)
        const error=new httpError("Something went wrong, Could not Delete tour",500)
        return next(error)
    }

    fs.unlink(imagePath,err=>{
        console.log(err)
    })

    res.status(200).json({
        message:"Deleted Successfully",
        tour:tour.toObject({getters:true})
    })
}

exports.getAllTours=getAllTours
exports.getParticularTour=getParticularTour
exports.updateParticularTour=updateParticularTour
exports.deleteParticularTour=deleteParticularTour
exports.getTourByUser=getTourByUser
exports.createTour=createTour