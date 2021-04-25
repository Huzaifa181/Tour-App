// add script of stripe in frontend index.js
import axios from 'axios';

const stripe=Stripe(process.env.STRIPE_PUBLIC_KEY)

export const bookTour=async tourId=>{
    try{
        //1) Get checklout session from API
        const session=await axios(`http://localhost:3000/api/booking/checkout-session/${tourId}`)
        
        //2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId:session.data.session.id
        })
    }
    catch(err){
        console.log(err)
    }
}