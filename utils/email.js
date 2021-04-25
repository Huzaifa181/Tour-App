const nodemailer=require('nodemailer');
const { options } = require('../Routes/review-routes');
const htmlToText = require('html-to-text');

module.exports=class Email{
    constructor(user,url){
        this.to=user.email;
        this.firstName=user.name.split(' ')[0]
        this.url=url
        this.from=`Huzaifa Ahmed <huzaifa.ahmed181@gmail.com>`
    }
    newTransport(){
        if(process.env.NODE_ENV=='production'){
            return nodemailer.createTransport({
                service:'SendGrid',
                auth:{
                    user:process.env.SENDGRID_USERNAME,
                    pass:process.env.SENDGRID_PASSWORD,
                }
            })
        }

        return nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            auth:{
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD,
            }
        })
    }
    async send(template,subject){
        // 1) Render html base on front side
        const html=pug.renderFile(`${__dirname}/../../../../frontend/emails/${template}.js`,{
            firstName:this.firstName,
            url:this.url,
            subject
        })
        
        //2) Define email option
        const mailOptions={
            from:this.from,
            to:this.to,
            subject,
            html,
            text:htmlToText.fromString(html)
        }
        //3) create a transport and send email
        await this.newTransport().sendEmail(mailOptions); 
    }

    async sendWelcome(){
        await this.send('welcome','Welcome to the Natours family')
    }
    async sendPasswordReset(){
        await this.send('passwordReset','Your password reset token valid for 10 minutes')
    }
}
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