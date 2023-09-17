const express = require("express");
const fetch = require("node-fetch");
const {
  getReqeuest,
  sample,
  sendEmailForPasswordReset,
  passwordReset,
  updateOrderStatusByTruck,
} = require("../Controllers/generalController");
const generalRoutes = express.Router();

generalRoutes.get("/", getReqeuest);
generalRoutes.post("/sample", sample);

// generalRoutes/sendEmailForPasswordReset  --> run this api first, it will return email and otp
generalRoutes.post("/sendEmailForPasswordReset", sendEmailForPasswordReset);

// generalRoutes/passwordReset    --> run this api after /sendEmailForPasswordReset
generalRoutes.post("/passwordReset", passwordReset);

// update order status by truck
// /generalRoutes/updateOrderStatusByTruck
generalRoutes.put("/updateOrderStatusByTruck", updateOrderStatusByTruck);

module.exports = generalRoutes;
