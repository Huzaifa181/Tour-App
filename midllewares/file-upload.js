const multer=require('multer');
const uuid=require('uuid');
const httpError=require("../utils/http-error")
const MIME_TYPE_MAP={
    'images/png':'png',
    'images/jpg':'jpg',
    'images/jpeg':'jpeg',
}

const fileUpload=multer({
    limits:500000,
    // storage:multer.diskStorage({
    //     destination:(req,file,cb)=>{
    //         cb(null, 'uploads/images');
    //     },
    //     filename:(req, file,cb)=>{
    //         const ext=MIME_TYPE_MAP[file.mimetype]
    //         cb(null,uuid()+'.'+ext)
    //     },
    // }),

    // To resize the image
    storage:multer.memoryStorage(),
    fileFilter:(req, file,cb)=>{
        if(file.mimetype.startsWith('image')){
            cb(null,true)
        }else{
            cb(new httpError("Not an image please upload only images",401),false)
        }
        // const isValid= !!MIME_TYPE_MAP[file.mimetype];
        // let error=isValid?null:new Error("Invalid Mime Type");
        // cb(error, isValid);
    }
})


exports.fileUpload=fileUpload