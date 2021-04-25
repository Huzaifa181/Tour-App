const Tour=require('../Models/tours')
const {validationResult}=require("express-validator")
const User=require('../Models/users')
const fs=require('fs')
const httpError=require("../utils/http-error")
const mongoose=require('mongoose')

const getTourByUser=async (req,res,next)=>{
    const id=req.params.uid
    let identifiedTour;
    try{
        // if you want to populate in ll request of find so use this.populate in the mongoose middleware using /^find/
        identifiedTour=await Tour.find({creator:id}).populate(
            {
                path:'guides',
                select:'-__v -passwordChangedAt'
            })
    }
    catch(err){
        const error=new httpError("Fatching Tours Failed, Could not find Tour",401)
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
        identifiedTour=await Tour.findById(id).populate('reviews')
    }
    catch(err){
        
        const error=new httpError("Something went wrong, Could not Find Tour",500)
        return next(error)
    }
    if(!identifiedTour){
        const error=new httpError("Could not Find Tour for the particular id",404)
        return next(error)
    }
    res.status(200).json({
        tour:identifiedTour.toObject({getters:true})
    })
}

const getTourStats=async (req,res,next)=>{
    try{
        const stats=await Tour.aggregate([
            {
                $match:{ratingAverage:{$gte:4.5}}
            },
            {
                $group:{
                    _id:{$toUpper:'$difficulty'}, //means group the difficulty accordign to the values it will show thre documents one stats for Medium, Easy and Hard
                    numTours:{$sum:1},
                    numRatings:{$sum:'$ratingQuantity'},
                    avgRatings:{$avg:'$ratingAverage'},
                    avgPrice:{$avg:'$price'},
                    minPrice:{$min:'$price'},
                    maxPrice:{$max:'$price'},
                }
            },
            {
                $sort:{
                    avgPrice:1
                }
            },
            {
                $match:{_id:{$ne:'EASY'}}
            }
        ])
    }
    catch(err){

    }
}

const getMonthlyPlans=async (req,res,next)=>{
    try{
        const year=req.query.year*1
        const plan=await Tour.aggregate([
            {
                $unwind:'$startDates' //if there is the field having value of array in once document so this will show us document for each element in the array 
            },
            {
            $match:{
                startDates:{
                    $gte:new  Date(`${year}-01-01`),
                    $lte:new Date(`${year}-12-31`)
                }
            }
            },
            {$group:{
                _id:{$month:'$startDates'}, //This return the month no from the date
                numTourStarts:{$sum:1},
                tours:{$push:'$name'} // This makes the array
            }
        },
        {
            $addFields:{month:'$_id'}
        },
        {
            $project:{
                _id:0 //This exclude the _id field from the documents
            }
        },
        {
            $sort:{numTourStarts:-1} //Descending Order
        },
        {
            $limit:12 //Only 6 documents show
        }
        ])
        res.status(200).json({
            status:'success',
            data:{
                plan
            }
        })
    }
    catch(err){
        const error=new httpError("Fail",404)
        return next(error)
    }
}
const getAllTours=async (req,res,next)=>{
    let data
    // 1) filtering
    let queryObj={...req.query}
    const excludedFields=["sort",'page','fields','limit']
    excludedFields.forEach(el=>delete queryObj[el])

    //Advanced Filtering
    let queryStr=JSON.stringify(queryObj)
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/,match=>`$${match}`)
    //So in API (http://api/tours?duration[lte]=34)
    console.log(JSON.parse(queryStr))
    try{
        data=await Tour.find(JSON.parse(queryStr));
        //2) Sorting
        if(req.query.sort){
            const sortBy=req.query.sort.split(',').join(' ')
            //So in API (http://api/tours?sort=price,ratingAverage)
            //if 2 doc have same price so it will sort acc to ratingAverage
            //By default this will sort in ascending order
            data=data.sort(sortBy)
        }else{
            data=data.sort('-createdAt')
            //This will sort according to the descending order
        }

        // 3) Fields Limiting: Means Show which fields in the document to res
        if(req.query.sort){
            const fields=req.query.fields.split(',').join(" ")
            data=data.select(fields)
            // So in the API http://tours?fields=price, -duration
            // price means including and -duration means excluding to show the res to users
            // You can also build this in the schema by type "select=false"
        }
        else{
            query=query.select('-__v')
        }

        //4) Pagination
        const page=req.query.page * 1 || 1;
        const limit=req.query.limit* 1 || 10;
        const skip=(page-1)*limit

        data=data.skip(skip).limit(limit)
        // So in the API http://tours?page=3&limit=3
        if(req.query.page){
            const numTour=await Tour.countDocuments();
            if(skip>numTour){
                throw new Error("Could Not Find That Page")
            }
        }
    }
    catch(err){
        const error=new httpError("Could not Find Tours",500)
        return next(error)
    }
    if(data.length==0){
        const error=new httpError("No Tour",201)
        return next(error)
    }
    const tours=await data
    res.status(201)
    res.json({
        status:"Success",
        data:tours
    })
}

const createTour=async (req,res,next)=>{
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
    res.status(200)
    res.json({
        message:'Tour Created Successfully',
        data:createTour
    })
}
const updateParticularTour=async (req,res,next)=>{
    let tour
    try{
        tour=await Tour.findOneAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
        res.status(200).json({
            status:'success',
            tour
        })
    }
    catch(err){
        res.status(200).json({
            status:'fail',
            message:err
        })
    }
}
const deleteParticularTour=async (req,res,next)=>{
    const pid=req.params.pid
    var tour;
    try{
        tour=await Tour.findByIdAndDelete(pid)
        res.status(200).json({
            status:'success',
            data:null
        })
    }
    catch(err){
        const error=new httpError("Error in Deleting Tour",400)
        return next(error)
    }
}
const aliasTopTours=(req,res,next)=>{
    req.query.limit='5';
    req.query.sort='-ratingAverage,price',
    req.query.fields='name,price,ratingAverage,summary,difficulty',
    next()
}

// working with geospecial query
// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/345.11,-34.47/unit/mi
// You must add the index of the startLocation in tour model file
 const getTourWithin=(req,res,next)=>{
    const {distance,latlng,unit}=req.params
    const {lat,lng}=latlng.split(',');

    // 3963.2 is th radius of the earth in miles and 6378.1 is the radius of the earth in km
    const radius=unit==='mi'?distance/3963.2 : distance/6378.1;

    if(!lat || !lng){
        const error=new httpError("Please provide lat and lng in the format lat,lng",401)
            return next(error)
    }
    const tours=Tour.find({startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}})
    res.status(200).json({
        status:'success',
        results:tours.length,
        data:{
            data:tours
        }
    })
 }
  
// means distace between all the tours from particular point
// You must add the index of the startLocation in tour model file
 const getDistances=async()=>{
    const {latlng,unit}=req.params
    const {lat,lng}=latlng.split(',');

    if(!lat || !lng){
        const error=new httpError("Please provide lat and lng in the format lat,lng",401)
            return next(error)
    }
    // it gives the distance always in meters
    const distances=await Tour.aggregate([
        {
            // It must be in the first position
            $geoNear:{
                $near:{
                    type:'Point',
                    coordinates:[lng*1,lat*1]
                },
                //distance is the field which we create only here to show all doc in the distance field
                distanceField:'distance',
                distanceMultiplier:0.001 // for give the result in km
            }
            } ,{
                $project:{
                   distance:1,
                   name:1
                }
        }
    ])
    res.status(200).json({
        status:'success',
        data:{
            data:distances
        }
    })
 } 
exports.getAllTours=getAllTours
exports.getParticularTour=getParticularTour
exports.updateParticularTour=updateParticularTour
exports.deleteParticularTour=deleteParticularTour
exports.getTourByUser=getTourByUser
exports.getTourStats=getTourStats
exports.aliasTopTours=aliasTopTours
exports.createTour=createTour
exports.getMonthlyPlans=getMonthlyPlans
exports.getTourWithin=getTourWithin
exports.getDistances=getDistances