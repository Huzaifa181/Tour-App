const express= require("express");
const reviewController=require('../Controller/reviews')
const {check}= require("express-validator"); 
const checkAuth=require('../midllewares/check-auth');
const {restrictTo}=require('../midllewares/restrictUserRolesPermission');

const router=express.Router()


router.route('/').
get(reviewController.getAllReviews).
post(
    checkAuth,
    restrictTo('user'),
    reviewController.createReview,
    
    )
module.exports=router