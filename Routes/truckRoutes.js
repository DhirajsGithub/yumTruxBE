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
} = require("../Controllers/truckController");
const truckRoute = express.Router();

// /truck
truckRoute.post("/signup", signup);
truckRoute.post("/signin", signin);
truckRoute.patch("/upateBasicData/:truckId", upateBasicData);
truckRoute.patch("/addSchedule/:truckId", addSchedule);
truckRoute.patch("/deleteSchedule/:truckId", deleteSchedule);
truckRoute.patch("/addTruckMenu/:truckId", addTruckMenu);
truckRoute.patch("/deleteTruckMenu/:truckId", deleteTruckMenu);
truckRoute.put("/updateStripePaymentId/:truckId", updateStripePaymentId);

// /truck/updatePaypalEmail/:truckId  --> will update seller's paypal email in db when it's onboarding is done
truckRoute.put("/updatePaypalEmail/:truckId", updatePaypalEmail);

module.exports = truckRoute;
