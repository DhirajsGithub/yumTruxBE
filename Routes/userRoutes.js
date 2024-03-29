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
  validate,
  userStatus,
  addExpoPushToken,
  sendPushNotification,
  addNotification,
  updateNotification,
  getNotifications,
  updatePaymentDetails,
} = require("../Controllers/userController");
const userRoute = express.Router();

userRoute.get("/", (req, res) => {
  return res.send("Welcome to YumTrux :) \nWe are here for your serving <3");
});

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

userRoute.get("/userStatus/:userId", userStatus);

userRoute.put("/addExpoPushToken/:userId", addExpoPushToken);

userRoute.post("/sendPushNotification", sendPushNotification);

// /addNotification/
userRoute.put("/addNotification/", addNotification);

// /updateNotification/:userId/:notificationId
userRoute.put(
  "/updateNotification/:userId/:notificationId",
  updateNotification
);

// /getNotifications/:userId/
userRoute.get("/getNotifications/:userId/", getNotifications);

// /updatePaymentDetails/:userId
userRoute.patch("/updatePaymentDetails/:userId", updatePaymentDetails);

module.exports = userRoute;
