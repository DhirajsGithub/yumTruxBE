const express = require("express");
const {
  signup,
  signin,
  orderHistory,
  updateUser,
  userDetails,
  deleteProfileImg,
  truckListDetail,
  updateFavTrucks,
  updateFavTrucksRemove,
  updateTruckRating,
  uploadProfileImgMogogDB,
  validate
} = require("../Controllers/userController");
const userRoute = express.Router();

userRoute.post("/signup", signup);

userRoute.post("/signin", signin);

userRoute.post("/validate", validate);

userRoute.patch("/orderHistory/:userId", orderHistory);

userRoute.patch("/updateUser/:userId", updateUser);

userRoute.patch("/favouriteTrucks/:userId", updateFavTrucks);

userRoute.patch("/favouriteTruckRemove/:userId", updateFavTrucksRemove);

userRoute.get("/userDetails/:userId", userDetails);

userRoute.post("/deleteProfileImg/:userId", deleteProfileImg);

userRoute.patch("/uploadProfileImgMogogDB/:userId", uploadProfileImgMogogDB);

userRoute.get("/truckListDetail", truckListDetail);

userRoute.patch("/updateRating/:truckId", updateTruckRating);

module.exports = userRoute;
