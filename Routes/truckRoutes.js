const express = require("express");
const {
  signup,
  signin,
  upateBasicData,
  addSchedule,
  deleteSchedule,
  addTruckMenu,
  deleteTruckMenu,
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

module.exports = truckRoute;
