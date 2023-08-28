require("dotenv").config();
const adminModel = require("../Models/Admin");
const truckOwnerModel = require("../Models/TruckOwner");
const trucksModel = require("../Models/Truck");
const userModel = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/SendMail");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const uniqid = require("uniqid");

const SECRET_KEY = "yumtruxsecret69";

// /admin/signin
const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email?.length > 0 && password?.length > 0) {
      const existingAdmin = await adminModel.findOne({
        email: email,
      });
      if (!existingAdmin) {
        return res
          .status(404)
          .json({ message: "Admin not found", status: "error" });
      }
      const matchPassword = await bcrypt.compare(
        password,
        existingAdmin.password
      );
      if (!matchPassword) {
        return res
          .status(400)
          .json({ message: "Password doesn't match", status: "error" });
      }
      const token = jwt.sign(
        {
          adminSecret: process.env.ADMIN_SECRET,
          email: existingAdmin.email,
          adminId: existingAdmin._id,
        },
        SECRET_KEY,
        { expiresIn: "1d" }
      );
      sendMail(existingAdmin.email, existingAdmin.name);
      return res.status(201).json({
        adminData: existingAdmin,
        token,
        status: "success",
        message: "Successfully login",
        tokenExpires: "2-days",
      });
    } else {
      return res
        .status(400)
        .json({ message: "email and password required", status: "error" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", status: "success" });
  }
};

// /admin/getUsers
const getUsers = async (req, res) => {
  const adminSecret = req.user.adminSecret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  const users = await userModel.find({});
  return res.send(users);
};

// /admin/blockUser
const blockUser = async (req, res) => {
  const userId = req.body.userId;

  const adminSecret = req.user.adminSecret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  try {
    const findUser = await userModel
      .findByIdAndUpdate({ _id: userId }, { $set: { status: "inactive" } })
      .then((user) => {
        return res.status(201).send({
          message: "Successfully block the user",
          status: "success",
        });
      })
      .catch((err) => {
        return res.status(400).send({
          message: "Couldn't find the user",
          status: "error",
        });
      });
  } catch (error) {
    return res.status(500).send({
      message: "Internal server error",
      status: "error",
    });
  }
};
// /admin/activateUser
const activateUser = async (req, res) => {
  const userId = req.body.userId;

  const adminSecret = req.user.adminSecret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  try {
    const findUser = await userModel
      .findByIdAndUpdate({ _id: userId }, { $set: { status: "active" } })
      .then((user) => {
        return res.status(201).send({
          message: "Successfully activate the user",
          status: "success",
        });
      })
      .catch((err) => {
        return res.status(400).send({
          message: "Couldn't find the user",
          status: "error",
        });
      });
  } catch (error) {
    return res.status(500).send({
      message: "Internal server error",
      status: "error",
    });
  }
};

// /admin/addCateogry
const addCategory = async (req, res) => {
  // category will have a unique id, it's name, it's image url and added on date
  const id = uniqid();

  // category must have a name and image url
  const { category } = req.body;

  // we are getting the adminId from the token, since token is made up of adminId, adminSecret and email
  const adminId = req.user.adminId;

  const adminSecret = req.user.adminSecret;
  if (category && category.name && category.imgUrl) {
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({
        message: "You are not authorized to access this route",
        status: "error",
      });
    }
    try {
      const findAdmin = await adminModel
        .findByIdAndUpdate(
          { _id: adminId },
          {
            $push: {
              categories: { ...category, categoryId: id, addedOn: new Date() },
            },
          }
        )
        .then((admin) => {
          return res.status(201).send({
            message: "Successfully added the category",
            status: "success",
          });
        })
        .catch((err) => {
          return res.status(400).send({
            message: "Couldn't find the admin",
            status: "error",
          });
        });
    } catch (error) {
      return res.status(500).send({
        message: "Internal server error",
        status: "error",
      });
    }
  } else {
    return res.status(400).json({
      message: "category name and imgUrl required",
      status: "error",
    });
  }
};

// /admin/deleteCategory
const deleteCategory = async (req, res) => {
  const { categoryId } = req.body;

  // we are getting the adminId from the token, since token is made up of adminId, adminSecret and email
  const adminId = req.user.adminId;
  const adminSecret = req.user.adminSecret;
  if (categoryId?.length > 0) {
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({
        message: "You are not authorized to access this route",
        status: "error",
      });
    }
    try {
      const findAdmin = await adminModel
        .findByIdAndUpdate(
          { _id: adminId },
          {
            $pull: {
              categories: { categoryId },
            },
          }
        )
        .then((admin) => {
          return res.status(201).send({
            message: "Successfully deleted the category",
            status: "success",
          });
        })
        .catch((err) => {
          return res.status(400).send({
            message: "Couldn't find the admin",
            status: "error",
          });
        });
    } catch (error) {
      return res.status(500).send({
        message: "Internal server error",
        status: "error",
      });
    }
  } else {
    return res.status(400).json({
      message: "category id required",
      status: "error",
    });
  }
};

// /admin/getCategories
const getCategories = async (req, res) => {
  let categories = await adminModel.find({}).select("categories");
  return res.status(200).json({
    categories: categories[0]?.categories ? categories[0]?.categories : [],
    status: "success",
  });
};

// /admin/dashboardNumbers
const dashboardNumbers = async (req, res) => {
  const adminSecret = req.user.adminSecret;
  const adminId = req.user.adminId;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  const categories = await adminModel
    .findById({ _id: adminId })
    .select("categories");

  const categoryCount = categories?.categories?.length
    ? categories?.categories?.length
    : 0;

  const usersCount = await userModel.find({}).count();
  const trucksCount = await trucksModel.find({}).count();
  const truckOwnersCount = await truckOwnerModel.find({}).count();
  return res
    .status(201)
    .json({ categoryCount, usersCount, trucksCount, truckOwnersCount });
};

// /admin/getTruckOwners
const getTruckOwners = async (req, res) => {
  const adminSecret = req.user.adminSecret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  const truckOwners = await truckOwnerModel.find({});
  return res.send(truckOwners);
};

const findRating = (ratingLi) => {
  if (ratingLi?.length > 0) {
    const sum = ratingLi.reduce((a, b) => a + b, 0);
    return Math.round(sum / ratingLi.length);
  }
  return 0;
};

// /admin/getTruckList
const getTruckList = async (req, res) => {
  const adminSecret = req.user.adminSecret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  const trucks = await trucksModel.find({});
  let updatedTruck = [];
  trucks?.forEach((truck) => {
    updatedTruck.push({
      ...truck._doc,
      avgRating: findRating(truck.ratings),
    });
  });

  return res.send(updatedTruck);
};

// /admin/deactivateTruck
const deactivateTruck = async (req, res) => {
  const truckId = req.body.truckId;

  const adminSecret = req.user.adminSecret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  try {
    const findTruck = await trucksModel
      .findByIdAndUpdate({ _id: truckId }, { $set: { status: "inactive" } })
      .then((truck) => {
        // send mail as well push notification accept mail and push notification token from body
        return res.status(201).send({
          message: "Successfully deactivate the truck",
          status: "success",
        });
      })
      .catch((err) => {
        return res.status(400).send({
          message: "Couldn't find the truck",
          status: "error",
        });
      });
  } catch (error) {
    return res.status(500).send({
      message: "Internal server error",
      status: "error",
    });
  }
};

// /admin/activateTruck
const activateTruck = async (req, res) => {
  const truckId = req.body.truckId;

  const adminSecret = req.user.adminSecret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  try {
    const findTruck = await trucksModel
      .findByIdAndUpdate({ _id: truckId }, { $set: { status: "active" } })
      .then((truck) => {
        // send mail as well push notification accept mail and push notification token from body
        return res.status(201).send({
          message: "Successfully activate the truck",
          status: "success",
        });
      })
      .catch((err) => {
        return res.status(400).send({
          message: "Couldn't find the truck",
          status: "error",
        });
      });
  } catch (error) {
    return res.status(500).send({
      message: "Internal server error",
      status: "error",
    });
  }
};

module.exports = {
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
};
