const express = require("express");
const {
  signup,
  signin,
  orderHistory,
  updateUser,
  userDetails,
  updateProfileImg,
  truckListDetail,
  updateFavTrucks,
  updateFavTrucksRemove,
} = require("../Controllers/userController");
const multer = require("multer");
const userRoute = express.Router();

const uploads = multer();

userRoute.post("/signup", signup);

userRoute.post("/signin", signin);

userRoute.patch("/orderHistory/:userId", orderHistory);

userRoute.patch("/updateUser/:userId", updateUser);

userRoute.patch("/favouriteTrucks/:userId", updateFavTrucks);

userRoute.patch("/favouriteTruckRemove/:userId", updateFavTrucksRemove);

userRoute.get("/userDetails/:userId", userDetails);

userRoute.post("/updateProfileImg/:userId", updateProfileImg);

userRoute.get("/truckListDetail", truckListDetail);

module.exports = userRoute;

let p = {
  items: [
    {
      itemId: 11,
    },
    {
      itemId: 11,
    },
    {
      itemId: 12,
    },
    {
      itemId: 13,
    },
    {
      itemId: 11,
    },
  ],
  orderOn: "10:34 PM, May 14",
  totalPrice: 124,
  truckId: 1,
  orderHistId: 43432,
};
