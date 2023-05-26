const express = require("express");
const {
  signup,
  signin,
  orderHistory,
  updateUser,
  userDetails,
} = require("../Controllers/userController");
const userRoute = express.Router();

userRoute.post("/signup", signup);

userRoute.post("/signin", signin);

userRoute.patch("/orderHistory/:userId", orderHistory);

userRoute.patch("/updateUser/:userId", updateUser);

userRoute.get("/userDetails/:userId", userDetails);

module.exports = userRoute;
