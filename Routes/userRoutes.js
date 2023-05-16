const express = require("express");
const { signup, signin } = require("../Controllers/userController");
const userRoute = express.Router();

userRoute.post("/signup", signup);

userRoute.post("/signin", signin);

module.exports = userRoute;
