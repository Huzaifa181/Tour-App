const express= require("express");
const bookingController=require('../Controller/booking');
const checkAuth=require('../midllewares/check-auth');
const {resizeUserPhoto}=require('../midllewares/resizeUserPhoto');
const {check}= require("express-validator");
const {fileUpload}=require('../midllewares/file-upload');

const route=express.Router();

route.get('/checkout-session/:tourId',checkAuth,bookingController.getCheckoutSession)

// route.post('/create-new-booking',)
// route.post('/',)
// route.get('/:id',)
// route.get('/',)
// route.patch('/:id',)
// route.delete('/:id',)

module.exports=route