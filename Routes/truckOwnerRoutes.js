const express = require("express");
const {
  signup,
  signin,
  deactivateTruck,
  activateTruck,
  getTruckOwnerTrucks,
  updateBasicInfo,
  addNotification,
  updateNotification,
  getNotifications,
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

// /truckOwner/updateBasicInfo/:truckOwnerId
truckOwnerRoutes.put("/updateBasicInfo/:truckOwnerId", updateBasicInfo);

// /truckOwner/addNotification/
truckOwnerRoutes.put("/addNotification/", addNotification);

// /truckOwner/updateNotification/:truckOwnerId/:notificationId
truckOwnerRoutes.put(
  "/updateNotification/:truckOwnerId/:notificationId",
  updateNotification
);

// /truckOwner/getNotifications/:truckOwnerId/
truckOwnerRoutes.get("/getNotifications/:truckOwnerId/", getNotifications);

module.exports = truckOwnerRoutes;
