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
  getTruckOwners,
  getTruckList,
  deactivateTruck,
  activateTruck,
  MonthlyPriceData,
  deleteProduct,
  addNotification,
  updateNotification,
  getNotifications,
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

// /admin/getTruckOwners
adminRoutes.get("/getTruckOwners/", authenticateToken, getTruckOwners);

// /admin/getTruckList
adminRoutes.get("/getTruckList/", authenticateToken, getTruckList);

// /admin/deactivateTruck/
adminRoutes.put("/deactivateTruck/", authenticateToken, deactivateTruck);

// /admin/activateTruck/
adminRoutes.put("/activateTruck/", authenticateToken, activateTruck);

// /admin/activateTruck/
adminRoutes.get("/MonthlyPriceData/", authenticateToken, MonthlyPriceData);

// /admin/deleteProduct
adminRoutes.delete("/deleteProduct/", authenticateToken, deleteProduct);

// /admin/addNotification
adminRoutes.put("/addNotification/", addNotification);

// /admin/updateNotification/:notificationId
adminRoutes.put(
  "/updateNotification/:notificationId",
  authenticateToken,
  updateNotification
);

// /admin/getNotifications
adminRoutes.get("/getNotifications/", authenticateToken, getNotifications);

module.exports = adminRoutes;
