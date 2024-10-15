import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import dbConnection from "./src/config/db.config.js";
import router from "./src/routes/index.router.js";
dotenv.config();

const url = process.env.MONGO_URL;
const port = process.env.PORT || 4000;
const app = express();
dbConnection(url);

// app.use(express.json())
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(router);

app.listen(port, () => {
  console.log(`The server is running port at ${port}`);
});
