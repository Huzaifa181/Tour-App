const express= require("express");
const tourRoutes=require('../Controller/tours');
// const reviewController=require('../Controller/reviews');
const reviewRoutes=require('./review-routes');
const {check}= require("express-validator");
const {fileUpload}=require('../midllewares/file-upload')
const {resizeUserPhoto}=require('../midllewares/resizeUserPhoto');
const checkAuth=require('../midllewares/check-auth');
const {restrictTo}=require('../midllewares/restrictUserRolesPermission');
const route=express.Router();

//nested routes to use review route
// this will work automatically for get and post request or creating or getting reviews
route.use('/:tourId/reviews',reviewRoutes)

route.get('/',tourRoutes.getAllTours);
route.get('/:pid',tourRoutes.getParticularTour);
route.get('/user/:uid',tourRoutes.getTourByUser);
route.get('/get-tour-stats',tourRoutes.getTourStats);
route.get('/getMonthlyPlans/:year',restrictTo('admin','lead-guide','guide'),tourRoutes.getMonthlyPlans);
route.get('/top-5-cheap',tourRoutes.aliasTopTours,tourRoutes.getAllTours);
route.get('/tour-within/:distancstarting and ending pointe/center/:latlng/unit/:unit',tourRoutes.getTourWithin);
// To find the distance between starting point in the database and the point in req params fro all the tours
// means distace between all the tours from particular point
route.get('/distances/:latlng/unit/:unit',tourRoutes.getDistances);

route.get('/tour-within/:distance/center/:latlng/unit/:unit',tourRoutes.getTourWithin);
//means u live in certain point (:latlng) and u want to find all the tour with in certain (:distance) and also specify unit

// For Protected Routes
route.use(checkAuth);
route.patch('/:pid',[
    check('title').
    not().
    isEmpty(),
    check('description').
    isLength({min:5}),
],restrictTo('admin','lead-guide'),tourRoutes.updateParticularTour)
route.delete('/:pid',restrictTo('admin','lead-guide'),tourRoutes.deleteParticularTour);
route.post('/',
    fileUpload.fields([
        {name:'imageCover',maxCount:1},
        {name:'images',maxCount:3},
    ]),
    resizeUserPhoto,
    [
    check('title').
    not().
    isEmpty(),
    check('description').
    isLength({min:5}),
    check('address').
    not().
    isEmpty(),
    
],restrictTo('admin','lead-guide'),tourRoutes.createTour)


module.exports=route