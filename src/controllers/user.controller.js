import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import passGenerator from "generate-password";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

dotenv.config();
const seckret_ket = process.env.SECKRET_KEY;

// export  const Pagination =  async (req, res) => {
//     const page = parseInt(req.body.page) || 1;
//     const limit = parseInt(req.body.limit) || 4;
//   try {

//         const items = await userModel.find({}).skip((page - 1) * limit)  .limit(limit);
//         const totalItems = await userModel.countDocuments({});
//        console.log(totalItems);

//       res.send({currentPage: page,totalPages: Math.ceil(totalItems / limit),totalItems: totalItems,items: items});
//   } catch (err) {
//       res.status(500).json({ error: 'Failed to fetch items' });
//   }
// }

import { success, failure, loginSuccess } from "../utils/reponseWrapper.js";
cloudinary.config({
  cloud_name: "dse7zacpv",
  api_key: "595674989194271",
  api_secret: "YzLjDHCet_7Pu6fidxAi8li_NXw",
});
// const imagePath = path.join(__dirname, 'path-to-your-image.jpg');
// cloudinary.uploader.upload(imagePath, { folder: 'uploads' }, function (error, result) {
//   if (error) {
//     console.log('Upload Error:', error);
//   } else {
//     console.log('Upload Successful:', result);
//   }
// });

export const handleUploadImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    console.log(result.secure_url);
    console.log(req.file.path);

    fs.unlink(req.file.path, (error) => {
      if (error) {
        return;
      }
      console.log("delete image");
    });
    res.send({ msg: "success", data: result.secure_url });
  } catch (error) {
    res.status(400).send({ msg: error, status: "failed", data: {} });
  }
};

export const handleRagisterUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      address,
      image,
      conf_Password,
      contact,
      isVerified,
    } = req.body;
    console.log(req.body);
    const OTP = Math.floor(1000 + Math.random() * 9000);
    const newHashed = await bcrypt.hash(password, 10);
    const exixctEmail = await userModel.findOne({ email });

    if (
      !name ||
      !email ||
      !password ||
      !address ||
      !image ||
      !conf_Password ||
      !contact
    ) {
      return res.status(400).send(failure("All Field is Required"));
    } else if (exixctEmail) {
      return res.status(400).send(failure("Email already registerd"));
    } else if (password === conf_Password) {
      //    let transporter = nodemailer.createTransport({
      //     host: "smtp.gmail.com",
      //     port: 465,
      //     secure: true, // true for 465, false for other ports
      //     auth: {
      //         user: 'jaydeeppanwar2003@gmail.com',
      //         pass: 'jlhq anbm vsys kxxm'
      //     }
      // });
      // let info=await transporter.sendMail({
      //     from: 'jaydeeppanwar2003@gmail.com',
      //     to:req.body.email,
      //     subject:"Hello",
      //     text:"OTP",
      //     html: `<html><body>Hello and welcome. Your OTP is: <b>${OTP}</b></body></html>`,
      // });

      // if(info.messageId)
      // {
      const response = await userModel.create({
        name: name,
        email: email,
        password: newHashed,
        address: address,
        contact: contact,
        image: image,
        otp: OTP,
        isVerified: isVerified,
      });

      return res.status(200).send(success(response));
    }

    //  }
    else {
      return res.status(400).send(failure("Wrong Password"));
    }
  } catch (error) {
    console.log(error);

    return res.status(500).send(failure(error));
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { userOtp } = req.body;
    const response = await userModel.updateOne(
      { otp: userOtp },
      { $set: { isVerified: true } }
    );
    const passGenerate = passGenerator.generate({ length: 10, numbers: true });
    const result = await userModel.findOne({ otp: userOtp });
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "jaydeeppanwar2003@gmail.com",
        pass: "jlhq anbm vsys kxxm",
      },
    });
    let info = await transporter.sendMail({
      from: "jaydeeppanwar2003@gmail.com",
      to: result.email,
      subject: "Hello",
      text: "passGenerate",
      html: `<html><body>Your Password is: <b>${passGenerate}</b></body></html>`,
    });

    if (info.messageId) {
      const hashPassword = await bcrypt.hash(passGenerate, 10);
      const response = await userModel.updateOne(
        { email: result.email },
        { $set: { password: hashPassword } }
      );

      return res.status(200).send(success(response));
    }
  } catch (error) {
    return res.status(400).send(error(error));
  }
};

export const handleLoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await userModel.findOne({
      email: email,
      status: true,
      isVerified: true,
    });

    if (response) {
      const comparePassword = await bcrypt.compare(password, response.password);
      console.log(comparePassword);

      if (comparePassword) {
        let token = jwt.sign({ ...response }, seckret_ket, { expiresIn: "1d" });
        return res.status(200).send(loginSuccess(response, token));
      } else {
        return res.status(400).send(failure(" Invalid password"));
      }
    } else {
      return res.status(400).send(failure("user not found"));
    }
  } catch (error) {
    return res.status(400).send(failure(error));
  }
};

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    let otp = generateOtp();
    const userData = await userModel.findOne({ email: email });

    if (!userData) {
      return res
        .status(400)
        .send({ error: "user not found", data: "", status: "Failed" });
    } else {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for 587 other ports
        auth: {
          user: "sm9107600@gmail.com",
          pass: "pbne tslc hrwr lcnu",
        },
      });
      let info = await transporter.sendMail({
        from: "sm9107600@gmail.com",
        to: req.body.email,
        subject: "Hello",
        text: "OTP",
        html: `<html><body>Hello and welcome. Your OTP is: <b>${otp}</b></body></html>`,
      });

      if (info.messageId) {
        console.log(info);
        let result = await userModel.updateOne(
          { email: email },
          { $set: { otp: otp } }
        );
        return res.status(200).send({
          msg: "OTP send successfully",
          status: "success",
          data: result,
          error: "",
        });
      }
    }
  } catch (error) {
    console.log(error.message);

    return res.status(400).send({ msg: "Failed", data: "", error: error });
  }
};

export const submitOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;

    const result = await userModel.findOne({ email: email });

    if (result.otp === otp) {
      return res.status(200).send({
        status: "User verification Successfully",
        data: result,
        error: "",
      });
    } else {
      return res.status(400).send({
        msg: "Invalid OTP",
        status: "User Verification Failed",
        data: "",
      });
    }
  } catch (error) {
    return res.status(400).send((error));
  }
};

export const handleUpdatePassword = async (req, res) => {
  try {
    const { password, confirmPassword, email } = req.body;
    console.log(req.body);

    if (password === confirmPassword) {
      const hashed = await bcrypt.hash(password, 10);
      console.log(hashed);

      let response = await userModel.updateOne(
        { email: email },
        { $set: { password: hashed } }
      );
      return res.status(200).send({
        msg: "Password updated successfully",
        status: "success",
        data: response,
      });
    } else {
      return res.status(400).send({
        msg: "Failed",
        data: "",
        error: "Password and Confirm Password does not match",
      });
    }
  } catch (error) {
    return res.status(400).send({ msg: "Failed", data: "", error: error });
  }
};
export const getAllData = async(req,res)=>{
  try {
     const response = await userModel.find({})
    //  console.log(response);
    res.status(200).send({msg:"get all data" , status:"success" , data:response})
     
  } catch (error) {
    res.status(500).send({msg:"server error" , status:"failed", error:error})
  }

}

export const handleGetAllUser = async (req, res) => {
  try {
    // res.send("hello");
    // const { page, limit } = req.query;
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 4;
    const items = await userModel.find({}).skip((page - 1) * limit)  .limit(limit);
    const totalItems = await userModel.countDocuments({});
   console.log(totalItems);

  res.send({currentPage: page,totalPages: Math.ceil(totalItems / limit),totalItems: totalItems,items: items});
  } catch (error) {
    return res.status(400).send(failure(error));
  }
};

export const handleDeleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await userModel.deleteOne({ _id: id });
    return res.status(200).send(success(response));
  } catch (error) {
    return res.status(400).send(failure(error));
  }
};

export const handleSeacrchUser = async (req, res) => {
  try {
    const key = req.params.key;
    const response = await userModel.find({
      $or: [
        { name: { $regex: key.trim(), $options: "i" } },
        { email: { $regex: key.trim(), $options: "i" } },
      ],
    });
    return res.status(200).send(success(response));
  } catch (error) {
    return res.status(400).send(failure(error));
  }
};

export const handleGetUser = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await userModel.findOne({ _id: id });
    return res.status(200).send(success(response));
  } catch (error) {
    return res.status(400).send(failure(error));
  }
};

export const handleUpdateUser = async (req, res) => {
  try {
    const { name, email, address, contact } = req.body;
    const id = req.params.id;

    const response = await userModel.updateOne(
      { _id: id },
      { $set: { name: name, email: email, address: address, contact: contact } }
    );

    return res.status(200).send(success(response));
  } catch (error) {
    return res.status(400).send(error);
  }
};

export const handleUpdateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const response = await userModel.updateOne(
      { _id: id },
      { $set: { status: status } }
    );
    return res.status(200).send(success(response));
  } catch (error) {
    return res.status(400).send(failure(error));
  }
};
