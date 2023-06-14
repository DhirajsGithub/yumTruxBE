const express = require("express");
const { signup, signin } = require("../Controllers/truckController");
const truckRoute = express.Router();

// /truck
truckRoute.post("/signup", signup);
truckRoute.post("/signin", signin);

module.exports = truckRoute;
