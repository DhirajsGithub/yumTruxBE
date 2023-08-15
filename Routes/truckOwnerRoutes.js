const express = require("express");
const {
  signup,
  signin,
  deactivateTruck,
  activateTruck,
  getTruckOwnerTrucks,
} = require("../Controllers/TruckOwnerController");

const truckOwnerRoutes = express.Router();

// /truckOwner/signup
truckOwnerRoutes.post("/signup", signup);

// /truckOwner/signin
truckOwnerRoutes.post("/signin", signin);

// /truckOwner/deactivateTruck/:truckOwnerId
truckOwnerRoutes.patch("/deactivateTruck/:truckOwnerId", deactivateTruck);

// /truckOwner/activateTruck/:truckOwnerId
truckOwnerRoutes.patch("/activateTruck/:truckOwnerId", activateTruck);

// /truckOwner/getTruckOwnerTrucks/:truckOwnerId
truckOwnerRoutes.post(
  "/getTruckOwnerTrucks/:truckOwnerId",
  getTruckOwnerTrucks
);

module.exports = truckOwnerRoutes;
