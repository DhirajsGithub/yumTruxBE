const express = require("express");
const { getReqeuest, sample } = require("../Controllers/generalController");
const generalRoutes = express.Router();

generalRoutes.get("/", getReqeuest);
generalRoutes.post("/sample", sample);

module.exports = generalRoutes;
