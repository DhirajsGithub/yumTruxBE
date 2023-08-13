const express = require("express");
const {
  signup,
  signin,
  upateBasicData,
  addSchedule,
  deleteSchedule,
  addTruckMenu,
  deleteTruckMenu,
  updateStripePaymentId,
  updatePaypalEmail,
  passwordReset,
  sendEmailForPasswordReset,
  truckDetails,
  addOrderToTruck,
  updateTruckLocation,
  addTruck,
} = require("../Controllers/truckController");

const truckRoute = express.Router();

// /truck
// truckRoute.post("/signup", signup);
// truckRoute.post("/signin", signin);

truckRoute.post("/addTruck", addTruck);
truckRoute.get("/truckDetails/:truckId", truckDetails);

truckRoute.patch("/upateBasicData/:truckId", upateBasicData);
truckRoute.patch("/addSchedule/:truckId", addSchedule);
truckRoute.patch("/deleteSchedule/:truckId", deleteSchedule);
truckRoute.patch("/addTruckMenu/:truckId", addTruckMenu);
truckRoute.patch("/deleteTruckMenu/:truckId", deleteTruckMenu);
truckRoute.put("/addOrderToTruck/:truckId", addOrderToTruck);
truckRoute.put("/updateTruckLocation/:truckId", updateTruckLocation);

truckRoute.put("/updateStripePaymentId/:truckId", updateStripePaymentId);

// /truck/updatePaypalEmail/:truckId  --> will update seller's paypal email in db when it's onboarding is done
truckRoute.put("/updatePaypalEmail/:truckId", updatePaypalEmail);

module.exports = truckRoute;
