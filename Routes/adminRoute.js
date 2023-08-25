const express = require("express");
const fetch = require("node-fetch");
const {
  signin,
  getUsers,
  blockUser,
  activateUser,
  addCategory,
  deleteCategory,
  getCategories,
  dashboardNumbers,
} = require("../Controllers/adminController");
const adminRoutes = express.Router();
const jwt = require("jsonwebtoken");
const SECRET_KEY = "yumtruxsecret69";

const authenticateToken = (req, res, next) => {
  const authToken = req.headers["authorization"];
  const token = authToken && authToken.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  // verify token
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};
// /admin/signin  ---> signin an admin
adminRoutes.post("/signin", signin);

// /admin/getUsers  ---> get all users
adminRoutes.get("/getUsers", authenticateToken, getUsers);

// /admin/blockUsr
adminRoutes.put("/blockUser/", authenticateToken, blockUser);

// /admin/activateUser
adminRoutes.put("/activateUser/", authenticateToken, activateUser);

// /admin/addCategory
adminRoutes.put("/addCategory/", authenticateToken, addCategory);

// /admin/deleteCategory
adminRoutes.delete("/deleteCategory/", authenticateToken, deleteCategory);

// /admin/getCategories
adminRoutes.get("/getCategories/", getCategories);

// /admin/dashboardNumbers
adminRoutes.get("/dashboardNumbers/", authenticateToken, dashboardNumbers);

module.exports = adminRoutes;
