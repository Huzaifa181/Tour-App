const httpError=require('../utils/http-error');
const sharp=require('sharp');

exports.resizeUserPhoto=async (req,res,next)=>{
    if(!req.file || !req.files.imageCover || !req.files.images) return next();
    
    req.file.filename=`user-${req.user.id}-${Date.now()}.jpeg`

    //For Cover Image
    if(req.files.imageCover){
        req.body.imageCover=`tour-${req.params.id}-${Date.now()}-cover.jpeg`
        await sharp(req.files.imageCover[0].buffer)
    .resize(2000,1300)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/tours/${req.body.imageCover}`)
    }

    // For Images
    if(req.body.images){
        await Promise.all(
            req.files.images.map(async (file,i)=>{
                const fileName=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`
                await sharp(file.buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/tours/${fileName}`)
})
)
}

// For user profile
if(req.file){
    await sharp(req.file.buffer)
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/users/${req.file.filename}`)
}
next()
}