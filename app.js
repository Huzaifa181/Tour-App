const connectDb=require('./config/db')
const express= require("express");
const bodyParser= require("body-parser");
const userRoutes= require("./Routes/user-routes");
const tourRoutes= require("./Routes/tour-routes");
const httpError = require("./Models/http-error");
const fs=require('fs');
const path=require('path');
const dotenv=require('dotenv');

const errorController=require('./Controller/error')
// To handled uncaughtException like programming error in the app.
process.on('uncaughtException',err=>{
    console.log(err)
    console.log("Uncaught Exception!, Shutting Down.....")
    console.log(err.name,err.message);
        //For Success write process.exit(0) server
        //For Uncaught exception write process.exit(1) server
    process.exit(1)
    })
dotenv.config({path:'./.env'})
connectDb();

const app=express();

app.use(bodyParser.json())

//static showing the image file in the browser

app.use('uploads/images',express.static(path.join('uploads','images')))

app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers",
    "Origin,X-Requested-W  ith,Content-Type,Accept, Authorization")
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE');
    next()
})


app.use('/api/tours',tourRoutes)
app.use('/api/users',userRoutes)
app.all('*',(req,res,next)=>{
    throw new httpError(`Could Not Find ${req.originalUrl} Route`,404);
})

app.use(errorController)
const server=app.listen(5000)
// To handled unhanledRejection like disconnection of mongodb server so we have to shutdown our app for this kind of error, However nodejs might be handled on production as to restart app.
process.on('unhandledRejection',err=>{
    console.log("Unhandled Rejection!, Shutting Down.....")
    console.log(err.name,err.message);
    server.close(()=>{
        //For Success write process.exit(0)
        //For Uncoaught exception write process.exit(1)
        process.exit(1)
    })
})
