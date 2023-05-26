const express = require("express");
const { getReqeuest } = require("../Controllers/generalController");
const generalRoutes = express.Router();

generalRoutes.get("/", getReqeuest);

module.exports = generalRoutes;
