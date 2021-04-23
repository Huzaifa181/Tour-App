const express= require("express");
const reviewController=require('../Controller/reviews')
const {check}= require("express-validator"); 
const checkAuth=require('../midllewares/check-auth');
const {restrictTo}=require('../midllewares/restrictUserRolesPermission');

const route=express.Router({mergeParams:true})

route.route('/').
get(reviewController.getAllReviews)

//For Protected Route
route.use(checkAuth)

route.post(restrictTo('user'),reviewController.createReview,)
route.delete(reviewController.deleteReview)
route.patch(reviewController.updateReview)
module.exports=route