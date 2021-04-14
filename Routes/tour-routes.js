const express= require("express");
const tourRoutes=require('../Controller/tours');
const {check}= require("express-validator");
const {fileUpload}=require('../midllewares/file-upload')
const checkAuth=require('../midllewares/check-auth');
const {restrictTo}=require('../midllewares/restrictUserRolesPermission');
const route=express.Router();

route.get('/',tourRoutes.getAllTours);
route.get('/:pid',tourRoutes.getParticularTour);
route.get('/user/:uid',tourRoutes.getTourByUser);
route.get('/get-tour-stats',tourRoutes.getTourStats);
route.get('/getMonthlyPlans/:year',tourRoutes.getTourStats);
// For Protected Routes
route.use(checkAuth);
route.patch('/:pid',[
    check('title').
    not().
    isEmpty(),
    check('description').
    isLength({min:5}),
],tourRoutes.updateParticularTour)
route.delete('/:pid',restrictTo('admin','lead-guide'),tourRoutes.deleteParticularTour);
route.post('/',
    fileUpload.single('image'),
    [
    check('title').
    not().
    isEmpty(),
    check('description').
    isLength({min:5}),
    check('address').
    not().
    isEmpty(),
],tourRoutes.createTour)

module.exports=route