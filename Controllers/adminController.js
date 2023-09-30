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
const { ActionMail } = require("../utils/AdminMail");
const { SupportMail } = require("../utils/SupportMail");

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
        process.env.JWT_SECRET,
        { expiresIn: "2d" }
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
  const reason = req.body.reason;
  const adminSecret = req.user.adminSecret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  try {
    const findTruck = await trucksModel
      .findByIdAndUpdate(
        { _id: truckId },
        { $set: { adminStatus: "inactive" } }
      )
      .then((truck) => {
        // send mail as well push notification accept mail and push notification token from body
        if (truck?.email) {
          ActionMail(
            truck.email,
            "YumTrux Truck Status Updated by the admin",
            `Your truck "${truck.name}" has been <strong style="color: #ef5350">Deactivated</strong> by the yumtrux admin.`,
            reason
          );
        }
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
  const reason = req.body.reason;
  const adminSecret = req.user.adminSecret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  try {
    const findTruck = await trucksModel
      .findByIdAndUpdate({ _id: truckId }, { $set: { adminStatus: "active" } })
      .then((truck) => {
        // send mail as well push notification accept mail and push notification token from body
        if (truck?.email) {
          ActionMail(
            truck.email,
            "YumTrux Truck Status Updated by the admin",
            `Your truck "${truck.name}" has been <strong style="color:#4caf50">Activated</strong> by the yumtrux admin.`,
            reason
          );
        }
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

// /admin/MonthlyPriceData
const MonthlyPriceData = async (req, res) => {
  const adminSecret = req.user.adminSecret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  let data = await adminModel.find({}).select("MonthlyPriceData");
  return res.status(200).json({
    data: data[0]?.MonthlyPriceData ? data[0]?.MonthlyPriceData : [],
    status: "success",
  });
};

// /admin/deleteProduct
const deleteProduct = async (req, res) => {
  const adminSecret = req.user.adminSecret;
  const { productId } = req.body;
  const adminId = req.user.adminId;
  if (!productId) {
    return res.status(400).json({
      message: "productId required",
      status: "error",
    });
  }
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
            MonthlyPriceData: {
              productId: productId,
            },
          },
        }
      )
      .then((admin) => {
        return res.status(201).send({
          message: "Successfully deleted the Package",
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
};

// admin/addNotification
const addNotification = async (req, res) => {
  const notification = req.body.notification;
  if (!notification) {
    return res.status(400).send({
      message: "notification required",
      status: "error",
    });
  }
  try {
    let owners = await adminModel
      .updateMany(
        {},
        {
          $push: {
            notifications: {
              ...notification,
              date: new Date(),
              viewed: false,
            },
          },
        },
        { multi: true }
      )
      .then((owners) => {
        return res.status(200).send({
          message: "Successfully updated notifications",
          status: "success",
        });
      })
      .catch((err) => {
        return res.status(400).send({
          message: "Couldn't find the truck owners",
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

// admin/updateNotification
const updateNotification = async (req, res) => {
  // if deleteNotification is true then delete the notification
  // else notification viewed will set to true
  const adminSecret = req.user.adminSecret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  const deleteNotification = req.body.deleteNotification;
  const notificationId = req.params.notificationId;
  if (!notificationId) {
    return res.status(400).send({
      message: "delete Notification bool and notificationId required",
      status: "error",
    });
  }
  if (deleteNotification) {
    try {
      let owner = await adminModel
        .updateMany(
          {},
          { $pull: { notifications: { notificationId: notificationId } } },
          { new: true }
        )
        .then((owner) => {
          return res.status(200).send({
            message: "Successfully deleted the notification",
            status: "success",
          });
        })
        .catch((err) => {
          return res.status(400).send({
            message: "Couldn't find the truck owner",
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
    try {
      let owner = await adminModel
        .updateMany(
          {
            notifications: { $elemMatch: { notificationId: notificationId } },
          },
          { $set: { "notifications.$.viewed": true } },
          { new: true }
        )
        .then((owner) => {
          return res.status(200).send({
            message: "Successfully updated the notification",
            status: "success",
          });
        })
        .catch((err) => {
          return res.status(400).send({
            message: "Couldn't find the truck owner",
            status: "error",
          });
        });
    } catch (error) {
      return res.status(500).send({
        message: "Internal server error",
        status: "error",
      });
    }
  }
};

// /admin/getNotifications
const getNotifications = async (req, res) => {
  const adminSecret = req.user.adminSecret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  try {
    let owner = await adminModel
      .find({})
      .then((owner) => {
        return res.status(200).send({
          notifications: owner[0]?.notifications ? owner[0]?.notifications : [],
          message: "Successfully fetched the notifications",
          status: "success",
        });
      })
      .catch((err) => {
        return res.status(400).send({
          message: "Couldn't find the truck owner",
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

// /admin/getTrucksPayment
const getTrucksPayment = async (req, res) => {
  const adminSecret = req.user.adminSecret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  try {
    let owner = await adminModel
      .find({})
      .then((owner) => {
        return res.status(200).send({
          truckPayments: owner[0]?.truckPayments ? owner[0]?.truckPayments : [],
          message: "Successfully fetched the truckPayments",
          status: "success",
        });
      })
      .catch((err) => {
        return res.status(400).send({
          message: "Couldn't find the truck owner",
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

// /admin/addToAllOrdersDetail
const addToAllOrdersDetail = async (req, res) => {
  const order = req.body.order;
  if (!order) {
    return res.status(400).send({
      message: "order required",
      status: "error",
    });
  }
  try {
    let owners = await adminModel
      .updateMany(
        {},
        {
          $push: {
            allOrdersDetail: {
              ...order,
            },
          },
        },
        { multi: true }
      )
      .then((owners) => {
        return res.status(200).send({
          message: "Successfully updated allOrdersDetail",
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
};

// /admin/getAllOrdersDetail
const getAllOrdersDetail = async (req, res) => {
  const adminSecret = req.user.adminSecret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      message: "You are not authorized to access this route",
      status: "error",
    });
  }
  try {
    let owner = await adminModel
      .find({})
      .then((owner) => {
        return res.status(200).send({
          allOrdersDetail: owner[0]?.allOrdersDetail
            ? owner[0]?.allOrdersDetail
            : [],
          message: "Successfully fetched the allOrdersDetail",
          status: "success",
        });
      })
      .catch((err) => {
        return res.status(400).send({
          message: "Couldn't find the truck owner",
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

// /admin/getCurrentPackage
const getCurrentPackage = async (req, res) => {
  let packages = await adminModel.find({}).select("MonthlyPriceData");
  return res.status(200).json({
    MonthlyPackage:
      packages[0]?.MonthlyPriceData?.length > 0
        ? packages[0]?.MonthlyPriceData[
            packages[0]?.MonthlyPriceData?.length - 1
          ]
        : {},
    status: "success",
  });
};

// /admin/supportEmail
const supportEmail = async (req, res) => {
  const { name, email, body, subject } = req.body;
  const adminEmail = adminModel.find({}).then((admin) => {
    console.log(admin[0]?.email);
    if (admin[0]?.email?.includes("@")) {
      try {
        console.log("try");
        SupportMail(name, email, body, subject, admin[0]?.email);
        return res.status(200).json({
          message: "Successfully sent the email",
          status: "success",
        });
      } catch (error) {
        return res.status(500).json({
          message: "Internal server error",
          status: "error",
        });
      }
    } else {
      return res.status(400).json({
        message: "Admin email not found",
        status: "error",
      });
    }
  });
  // console.log(name);
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
  MonthlyPriceData,
  deleteProduct,
  addNotification,
  updateNotification,
  getNotifications,
  getTrucksPayment,
  addToAllOrdersDetail,
  getAllOrdersDetail,
  getCurrentPackage,
  supportEmail,
};
