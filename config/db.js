const mongoose=require('mongoose')
const connectDb=async ()=>{
    try{
        var url="mongodb+srv://Huzaifa:Hanzala12@cluster0.n82wf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
        const conn=await mongoose.connect(url,
            {useNewUrlParser:true,
            useUnifiedTopology:true,
            useCreateIndex:true
        })
        console.log("Mongoose Connected ======>"+conn.connection.host)
    }
    catch(err){
        console.log("Mongoose Connect Failed ======>"+err.message)
    }
}
module.exports=connectDb