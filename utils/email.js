const nodemailer=require('nodemailer')
const sendEmail=async (options)=>{
//1) Create a transporter
const transporter=nodemailer.createTransport({
    //service:'Gmail',  Other services like Yahoo, hotmail
    host:process.env.EMAIL_HOST,
    port:process.env.EMAIL_PORT,
    auth:{
        user:process.env.EMAIL_USERNAME,
        pass:process.env.EMAIL_PASSWORD,
    }
    //Activate in gmail "less secure app" option just for sending fake emails
})
    //2) Define the email options
    const mailOption={
        from:'huzaifa.ahmed181@gmail.com',
        to:options.email,
        subject:options.subject,
        text:options.message
    }

    //3) Actually send the email
    await transporter.sendMail(mailOption)
}

module.exports=sendEmail