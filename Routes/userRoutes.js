const express = require("express");
const {
  signup,
  signin,
  orderHistory,
  updateUser,
  userDetails,
  updateProfileImg,
} = require("../Controllers/userController");
const multer = require("multer");
const userRoute = express.Router();

const uploads = multer();

userRoute.post("/signup", signup);

userRoute.post("/signin", signin);

userRoute.patch("/orderHistory/:userId", orderHistory);

userRoute.patch("/updateUser/:userId", uploads.single("profile"), updateUser);

userRoute.get("/userDetails/:userId", userDetails);

userRoute.get("/updateProfileImg/:userId", updateProfileImg);

module.exports = userRoute;
