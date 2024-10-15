import express from 'express'
import { handleDeleteUser, handleGetAllUser, handleGetUser, handleLoginUser, handleRagisterUser, handleSeacrchUser, handleUpdatePassword, handleUpdateStatus, handleUpdateUser, sendOtp, submitOtp, verifyOtp ,handleUploadImage,getAllData } from '../controllers/user.controller.js';
import autenticateUser from '../middelware/autentication.js';
import  multer from 'multer';
//  import upload from "../middelware/upload.js";
const userRouter=express.Router();

const uploadImage=multer({storage:multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads');
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+"_"+file.originalname);
    }
})});

// const upload=multer({storage:multer.diskStorage({
//     destination:function(req,file,cb){
//         cb(null,'./upload')
//     },
//     filename:function(req,file,cb){
//         cb(null,Date.now()+'-'+file.originalname)
//     }
//   })})

userRouter.route("/upload/image").post(uploadImage.single('image'),handleUploadImage)
userRouter.route("/register" ).post(handleRagisterUser)
userRouter.route('/login').post(handleLoginUser);
userRouter.route("/sendOtp").patch(sendOtp)
userRouter.route("/submitOtp").post(submitOtp)
userRouter.route("/verifyOtp").patch(verifyOtp)
userRouter.route("/newPassword").patch(handleUpdatePassword)
userRouter.route("/getUser").get(autenticateUser,handleGetAllUser)
userRouter.route('/deleteUser/:id').delete(handleDeleteUser)
userRouter.route('/searchUser/:key').get(handleSeacrchUser)
userRouter.route('/getOneUser/:id').get(handleGetUser)
userRouter.route('/updateUser/:id').patch(handleUpdateUser)
userRouter.route("/updateStatus/:id").patch(handleUpdateStatus)
userRouter.route("/getAllData").get(getAllData)
// userRouter.route("/Pagination").get(Pagination)
// userRouter.route("/upload" ,).post(image)



export default userRouter;