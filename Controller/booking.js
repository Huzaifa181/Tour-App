const Tour=require('../Models/tours')
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)

const getCheckoutSession=async (req,res,next)=>{
    // you have to crwate the global vatriable of stripe in frontend see in documenttion

    // 1) Get currently booked tour
    const tour=await Tour.findById(req.params.tourId)

    // 2) Create checkout session
    const seession=await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        success_url:`${req.protocol}://${req.get('host')}/`,
        cancel_url:`${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email:req.user.email,
        client_reference_id:req.params.tourId,
        line_items:[
            {
                name:`${tour.name} Tour`,
                description:tour.summary,
                images:[`http://localhost:3000/img/tours/${tour.imageCover}`],
                amount:tour.price*100, // 1 dollar=1 cent,
                currency:'usd',
                quantity:1
            }
        ]
    })

    // 3) create session a sresponse
    res.status(200).json({
        status:'success',
        session
    })
}

const createNewBooking= async (req,res,next)=>{
    // we must create a new booking after checkout... so this use the webhooks of stripe but we can use this only in production
}

exports.createNewBooking=createNewBooking // for webhook
// exports.createBooking=createBooking
// exports.getBooking=getBooking
// exports.getAllBookings=getAllBookings
// exports.updateBooking=updateBooking
// exports.deleteBooking=deleteBooking
exports.getCheckoutSession=getCheckoutSession
