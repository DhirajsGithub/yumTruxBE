require("dotenv").config();
const userModel = require("../Models/User");
const trucksModel = require("../Models/Truck");
const fetch = require("node-fetch");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uniqid = require("uniqid");
const { DeleteProfileImgCloudinary } = require("../utils/cloudinary");
const multer = require("multer");
const { defaultUserImg } = require("../utils/baseUrls");

const reqDate = new Date();

// /signup
const signup = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const existingUser = await userModel.findOne({
      // username and email both should be unique
      $or: [{ email: email }],
    });
    if (existingUser) {
      return res
        .status(400)
        .send({ message: "User already exist", status: "error" });
    }

    const hashPass = await bcrypt.hash(password, 8);

    const result = await userModel.create({
      email,
      username,
      password: hashPass,
      date: reqDate,
      fullName: "",
      favouriteTrucks: [],
      orderHistory: [],
      profileImg: defaultUserImg,
      phoneNo: "",
      address: "",
      passwordResetToken: "",
      status: "active",
      notifications: [],
      expoPushToken: "",
      paymentDetails: {},
    });

    const token = jwt.sign(
      { email: result.email, id: result._id },
      process.env.JWT_SECRET
    );
    return res.status(201).send({
      user: result,
      token,
      message: "Account created successfully",
      status: "success",
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Internal server error", status: "error" });
  }
};

// /signin
const signin = async (req, res) => {
  // can think of login with email or username as well
  const { email, password } = req.body;

  try {
    const existingUser = await userModel.findOne({
      email: email,
    });

    if (!existingUser) {
      return res
        .status(404)
        .send({ message: "User not found", status: "error" });
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password);
    if (!matchPassword) {
      return res
        .status(400)
        .send({ message: "Password doesn't match", status: "error" });
    }
    if (existingUser.status === "inactive") {
      return res.status(400).send({
        message: "Your account is not active, please contact admin",
        status: "error",
      });
    }
    const payload = { id: existingUser._id, email: existingUser.email };
    const secretKey = process.env.JWT_SECRET;

    const token = jwt.sign(payload, secretKey);

    return res.status(201).send({
      user: existingUser,
      token,
      status: "success",
      message: "Successfully login",
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Internal server error", status: "error" });
  }
};

// /orderHistory/:userId
const orderHistory = async (req, res) => {
  const userId = req.params.userId;
  const order = req.body.order;
  const notification = req.body.notification;
  try {
    const findUser = await userModel
      .findByIdAndUpdate(
        { _id: userId },
        {
          $push: {
            orderHistory: { ...order },
            notifications: {
              ...notification,
              date: new Date(),
              viewed: false,
            },
          },
        }
      )

      .then((user) => {
        return res.status(201).send({
          message: "successfully added order to order history",
          status: "success",
        });
      })
      .catch((err) => {
        return res
          .status(400)
          .send({ message: "Couldn't find the user", status: "error" });
      });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Cannot add order at this moment", status: "error" });
  }
};

// uploadProfileImgMogogDB/:userId
const uploadProfileImgMogogDB = async (req, res) => {
  const imgUrl = req.body.imgUrl;
  const userId = req.params.userId;
  try {
    const findUser = await userModel
      .findByIdAndUpdate({ _id: userId }, { profileImg: imgUrl })
      .then((user) => {
        return res.status(201).send({
          message: "Successfully updated profile image",
          status: "success",
        });
      })
      .catch((err) => {
        return res
          .status(400)
          .send({ message: "Couldn't find the user", status: "error" });
      });
  } catch (error) {
    return res.status(500).send({
      message: "Cannot update profile image at this moment",
      status: "error",
    });
  }
};

// deleteProfileImg/:userId
const deleteProfileImg = async (req, res) => {
  const userId = req.params.userId;
  try {
    let uploadedImg = await DeleteProfileImgCloudinary(userId);
    res.status(201).send(uploadedImg);
  } catch (error) {
    res.status(400).send("cannot delete");
  }
};

// /updateUser/:userId
const updateUser = async (req, res) => {
  const fullName = req.body.fullName;
  const phoneNo = req.body.phoneNo;
  const address = req.body.address;
  const userId = req.params.userId;
  try {
    const findUser = await userModel
      .findByIdAndUpdate({ _id: userId }, { fullName, phoneNo, address })
      .then((user) => {
        return res
          .status(201)
          .send({ message: "Successfully updated user", status: "success" });
      })
      .catch((err) => {
        return res
          .status(400)
          .send({ message: "Couldn't find the user", status: "error" });
      });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Cannot update user at this moment", status: "error" });
  }
};

// userDetails/:userId
const userDetails = async (req, res) => {
  const userId = req.params.userId;
  try {
    const findUser = await userModel
      .findById({ _id: userId })
      .then((user) => {
        return res
          .status(201)
          .send({ user, message: "success", status: "success" });
      })
      .catch((err) => {
        return res
          .status(400)
          .send({ message: "Couldn't find the user", status: "error" });
      });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Internal server error", status: "error" });
  }
};

function addDays(date, days) {
  date.setDate(date.getDate() + days);
  return date;
}

// truckListDetail
const truckListDetail = async (req, res) => {
  try {
    const trucks = await trucksModel
      .find({ status: "active" })
      .then((trucks) => {
        let temp = [];
        for (let truck of trucks) {
          if (
            truck.name.length > 0 &&
            truck.schedule.length > 0 &&
            truck.description.length > 0 &&
            truck.imgUrl.includes("http") &&
            truck.address.length > 0 &&
            truck.timing.length > 0 &&
            truck.menu.length > 0 &&
            (truck.paypalEmail || truck.paymentId) &&
            truck?.stripePaymentDate &&
            addDays(new Date(truck?.stripePaymentDate), 30) > new Date() &&
            truck.adminStatus === "active"
          ) {
            temp.push(truck);
          }
        }
        return res
          .status(201)
          .send({ truckList: temp, message: "success", status: "success" });
      })
      .catch((err) => {
        return res
          .status(400)
          .send({ message: "Couldn't find trucks list", status: "error" });
      });
  } catch (error) {
    req.status(500).send({ message: "Internal server error", status: "error" });
  }
};

// /favouriteTrucks/:userId
const updateFavTrucks = async (req, res) => {
  const userId = req.params.userId;
  const truckId = req.body.truckId;
  const newObjectId = uniqid();
  try {
    const findUser = userModel
      .findByIdAndUpdate(
        { _id: userId },
        { $push: { favouriteTrucks: { truckId, uniqueId: newObjectId } } }
      )
      .then((user) => {
        return res.status(201).send({
          message: "successfully added truck to favourite",
          status: "success",
        });
      })
      .catch((err) => {
        return res
          .status(400)
          .send({ message: "Couldn't find the user", status: "error" });
      });
  } catch (error) {
    return res.status(500).send({
      message: "Cannot update favourite truck at this moment",
      status: "error",
    });
  }
};

// /favouriteTruckRemove/:userId
const updateFavTrucksRemove = async (req, res) => {
  const userId = req.params.userId;
  const truckId = req.body.truckId;
  try {
    const findUser = userModel
      .findByIdAndUpdate(
        { _id: userId },
        { $pull: { favouriteTrucks: { truckId } } }
      )
      .then((user) => {
        return res.status(201).send({
          message: "successfully remove truck from favourite",
          status: "success",
        });
      })
      .catch((err) => {
        return res
          .status(400)
          .send({ message: "Couldn't find the user", status: "error" });
      });
  } catch (error) {
    return res.status(500).send({
      message: "Cannot update favourite truck at this moment",
      status: "error",
    });
  }
};

// /updateRating/:truckId
const updateTruckRating = async (req, res) => {
  const truckId = req.params.truckId;
  const rating = req.body.rating;
  try {
    const findTruck = trucksModel
      .findByIdAndUpdate({ _id: truckId }, { $push: { ratings: rating } })
      .then((truck) => {
        return res.status(201).send({
          message: "successfully added rating",
          status: "success",
        });
      })
      .catch((err) => {
        return res
          .status(400)
          .send({ message: "Couldn't find the truck", status: "error" });
      });
  } catch (error) {
    return res.status(500).send({
      message: "Internal server error",
      status: "error",
    });
  }
};

const checkToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
};

const validate = async (req, res) => {
  if (req.body.token) {
    const isValid = checkToken(req.body.token);

    if (isValid) {
      res.status(200).send({
        message: "Token is valid!",
        status: "success",
      });
    } else {
      res.status(201).send({
        message: "Token is invalid or expired!",
        status: "error",
      });
    }
  } else {
    res.status(201).send({
      message: "No token is provided",
      status: "error",
    });
  }
};

const userStatus = async (req, res) => {
  const userId = req.params.userId;
  try {
    const findUser = await userModel
      .findById({ _id: userId })
      .then((user) => {
        return res.status(201).send({
          status: user ? user.status : "inactive",
          message: "success",
        });
      })
      .catch((err) => {
        return res
          .status(400)
          .send({ message: "Couldn't find the user", status: "error" });
      });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Internal server error", status: "error" });
  }
};

const addExpoPushToken = async (req, res) => {
  const userId = req.params.userId;
  const expoPushToken = req.body.expoPushToken;

  if (!userId || !expoPushToken) {
    return res.status(400).send({
      message: "Please provide userId and expoPushToken",
      status: "error",
    });
  }
  try {
    const user = await userModel
      .findByIdAndUpdate({ _id: userId }, { expoPushToken })
      .then((user) => {
        return res.status(201).send({
          message: "Successfully added expoPushToken",
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

const sendPushNotification = async (req, res) => {
  const expoPushToken = req.body.expoPushToken;
  const title = req.body.title;
  const body = req.body.body;
  const data = req.body.data;
  if (!expoPushToken || !title || !body || !data) {
    return res.status(400).send({
      message: "Please provide expoPushToken, title, body and data",
      status: "error",
    });
  }
  const url = "https://exp.host/--/api/v2/push/send";
  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    data,
  };
  try {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    response = await response.json();
    if (!response.errors) {
      return res.status(201).send({
        message: "Successfully sent push notification",
        status: "success",
        response,
      });
    }
    return res.status(400).send({
      message: "Couldn't send push notification",
      status: "error",
      response,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal server error",
      status: "error",
    });
  }
};

const addNotification = async (req, res) => {
  const ids = req.body.ids; // user ids, must be in array
  const notification = req.body.notification;
  if (!notification || !ids) {
    return res.status(400).send({
      message: "notification and ids required",
      status: "error",
    });
  }
  try {
    let user = await userModel
      .updateMany(
        { _id: { $in: ids } },
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

const updateNotification = async (req, res) => {
  // if deleteNotification is true then delete the notification
  // else notification viewed will set to true
  const deleteNotification = req.body.deleteNotification; // boolean
  const userId = req.params.userId;
  const notificationId = req.params.notificationId;
  if (!userId || !notificationId) {
    return res.status(400).send({
      message: "userId and notificationId required",
      status: "error",
    });
  }

  if (deleteNotification) {
    try {
      let owner = await userModel
        .findOneAndUpdate(
          { _id: userId },
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
  } else {
    try {
      let owner = await userModel
        .findOneAndUpdate(
          {
            _id: userId,
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
  }
};
const getNotifications = async (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).send({
      message: "userId required",
      status: "error",
    });
  }
  try {
    let owner = await userModel
      .findById({ _id: userId })
      .then((owner) => {
        return res.status(200).send({
          notifications: owner.notifications,
          message: "Successfully fetched the notifications",
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

const updatePaymentDetails = async (req, res) => {
  const userId = req.params.userId;
  const paymentDetails = req.body.paymentDetails;
  if (!userId) {
    return res.status(400).send({
      message: "userId required",
      status: "error",
    });
  }
  try {
    let user = await userModel
      .findByIdAndUpdate(
        { _id: userId },
        { $set: { paymentDetails: paymentDetails } },
        { new: true }
      )
      .then((user) => {
        return res.status(200).send({
          message: "Successfully updated the payment details",
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

module.exports = {
  signin,
  signup,
  orderHistory,
  updateUser,
  userDetails,
  deleteProfileImg,
  truckListDetail,
  updateFavTrucks,
  updateFavTrucksRemove,
  updateTruckRating,
  uploadProfileImgMogogDB,
  validate,
  userStatus,
  addExpoPushToken,
  sendPushNotification,
  addNotification,
  updateNotification,
  getNotifications,
  updatePaymentDetails,
};
