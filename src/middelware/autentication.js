import { failure } from "../utils/reponseWrapper.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
const autenticateUser = (req, res, next) => {
  try {
    const BearerToken = req.headers["authorization"];
//    console.log("token"+BearerToken);
   
    if (!BearerToken) {
      res.status(400).send(failure("Token is required"));
    }
    const token = BearerToken.split(" ")[1];
    //  console.log(token);
     
    const decodeToken = jwt.verify(token, process.env.SECKRET_KEY);
    if (decodeToken) {
      next();
    } else {
      res.status(400).send(failure("Invalid token"));
    }
  } catch (error) {
    console.log(error);

    return res.status(400).send(failure("Token is expired"));
  }
};

export default autenticateUser;
