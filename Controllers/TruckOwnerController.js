require("dotenv").config();
const truckOwnerModel = require("../Models/TruckOwner");
const trucksModel = require("../Models/Truck");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/SendMail");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const uniqid = require("uniqid");
const { defaultUserImg } = require("../utils/baseUrls");

// /truckOwner/signup
const signup = async (req, res) => {
  const { email, username, password, phoneNo } = req.body;
  try {
    if (
      email?.length > 0 &&
      username?.length > 0 &&
      password?.length > 0 &&
      phoneNo
    ) {
      const existingTruckOwner = await truckOwnerModel.findOne({
        // username and email both should be unique
        $or: [{ email: email }],
      });
      if (existingTruckOwner) {
        return res
          .status(400)
          .json({ message: "User already exist", status: "error" });
      }

      const hashPass = await bcrypt.hash(password, 8);

      const result = await truckOwnerModel.create({
        name: "",
        username,
        password: hashPass,
        email,
        phoneNo,
        imgUrl: defaultUserImg,
        address: "",
        ownTrucks: [],
        passwordResetToken: "",
        joinOn: new Date(),
        notifications: [],
      });

      const token = jwt.sign(
        { email: result.email, id: result._id },
        process.env.JWT_SECRET,
        { expiresIn: "2d" }
      );
      return res.status(201).json({
        truckOwnerData: result,
        token,
        message: "Account created successfully",
        status: "success",
      });
    } else {
      return res.status(400).json({
        message: "email, password, username, phone number required",
        status: "error",
      });
    }
  } catch (error) {
    console.log(error);
    return res

      .status(500)
      .json({ message: "Internal server error", status: "error" });
  }
};

// /truckOwner/signin
const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email?.length > 0 && password?.length > 0) {
      const existingTruckOwner = await truckOwnerModel.findOne({
        email: email,
      });
      if (!existingTruckOwner) {
        return res
          .status(404)
          .json({ message: "User not found", status: "error" });
      }
      const matchPassword = await bcrypt.compare(
        password,
        existingTruckOwner.password
      );
      if (!matchPassword) {
        return res
          .status(400)
          .json({ message: "Password doesn't match", status: "error" });
      }
      const token = jwt.sign(
        { email: existingTruckOwner.email, id: existingTruckOwner._id },
        process.env.JWT_SECRET,
        { expiresIn: "2d" }
      );
      sendMail(existingTruckOwner.email, existingTruckOwner.username);
      return res.status(201).json({
        truckOwnerData: existingTruckOwner,
        token,
        status: "success",
        message: "Successfully login",
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

// /truckOwner/deactivateTruck/:truckOwnerId
const deactivateTruck = async (req, res) => {
  const { truckOwnerId } = req.params;
  const { truckId } = req.body;

  if (truckId?.length > 0 && truckOwnerId?.length > 0) {
    try {
      const findTruck = await truckOwnerModel
        .findOneAndUpdate(
          {
            _id: truckOwnerId,
            ownTrucks: { $elemMatch: { truckId: new ObjectId(truckId) } },
          },
          { $set: { "ownTrucks.$.status": "inactive" } }
        )
        .then(async (truck) => {
          await trucksModel
            .findByIdAndUpdate(
              { _id: truckId },
              { $set: { status: "inactive" } }
            )
            .then((truck) => {
              return res.status(201).send({
                message: "Successfully deactivated the truck",
                status: "success",
              });
            });
        })
        .catch((error) => {
          return res.status(400).send({
            message: "Couldn't find the truck owner",
            status: "error",
          });
        });
    } catch (error) {
      return res.status(400).send({
        message: "Couldn't find the truck",
        status: "error",
      });
    }
  } else {
    return res.status(400).send({
      message: "truckId and truckOwnerId required",
      status: "error",
    });
  }
};

// /truckOwner/activateTruck/:truckOwnerId
const activateTruck = async (req, res) => {
  const { truckOwnerId } = req.params;
  const { truckId } = req.body;

  if (truckId?.length > 0 && truckOwnerId?.length > 0) {
    try {
      const findTruck = await truckOwnerModel
        .findOneAndUpdate(
          {
            _id: truckOwnerId,
            ownTrucks: { $elemMatch: { truckId: new ObjectId(truckId) } },
          },
          { $set: { "ownTrucks.$.status": "active" } }
        )
        .then(async (truck) => {
          await trucksModel
            .findByIdAndUpdate({ _id: truckId }, { $set: { status: "active" } })
            .then((truck) => {
              return res.status(201).send({
                message: "Successfully activated the truck",
                status: "success",
              });
            });
        })
        .catch((error) => {
          return res.status(400).send({
            message: "Couldn't find the truck owner",
            status: "error",
          });
        });
    } catch (error) {
      return res.status(400).send({
        message: "Couldn't find the truck",
        status: "error",
      });
    }
  } else {
    return res.status(400).send({
      message: "truckId and truckOwnerId required",
      status: "error",
    });
  }
};

const findRating = (ratingLi) => {
  if (ratingLi?.length > 0) {
    const sum = ratingLi.reduce((a, b) => a + b, 0);
    return Math.round(sum / ratingLi.length);
  }
  return 0;
};

// /truckOwner/getAllTrucks/:truckOwnerId
const getTruckOwnerTrucks = async (req, res) => {
  const truckOwnerId = req.params.truckOwnerId;

  const email = req.body.email;
  try {
    const truckOwner = truckOwnerModel
      .findById({ _id: truckOwnerId })
      .then(async (truckOwner) => {
        const trucks = await trucksModel
          .find({ email: email })
          .then((trucks) => {
            let updatedTruck = [];
            trucks?.forEach((truck) => {
              updatedTruck.push({
                ...truck._doc,
                avgRating: findRating(truck.ratings),
              });
            });
            if (trucks?.length === 0) {
              return res.status(201).send({
                trucks: updatedTruck,
                message: "please check email or add truck",
                status: "success",
              });
            }
            return res.status(201).send({
              trucks: updatedTruck,
              message: "success",
              status: "success",
            });
          })
          .catch((err) => {
            return res
              .status(400)
              .send({ message: "Couldn't find truck", status: "error" });
          });
      })
      .catch((err) => {
        return res
          .status(400)
          .send({ message: "Couldn't find truck owner", status: "error" });
      });
  } catch (error) {
    res.status(500).send({ message: "Internal server error", status: "error" });
  }
};

// /truckOwner/updateBasicInfo/:truckOwnerId
const updateBasicInfo = async (req, res) => {
  const { imgUrl, name, address, phoneNo } = req.body;
  const truckOwnerId = req.params.truckOwnerId;
  if (
    imgUrl?.length > 0 &&
    name?.length > 0 &&
    address?.length > 0 &&
    phoneNo?.length > 0
  ) {
    try {
      const findTruckOwner = await truckOwnerModel
        .findByIdAndUpdate(
          { _id: truckOwnerId },
          {
            $set: {
              imgUrl: imgUrl,
              name: name,
              address: address,
              phoneNo: phoneNo,
            },
          }
        )
        .then((trukOwner) => {
          return res.status(201).send({
            message: "Successfully updated the truck owner",
            status: "success",
          });
        })
        .catch((error) => {
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
    return res.status(400).send({
      message: "imgUrl, name, address, phoneNo required",
      status: "error",
    });
  }
};

const addNotification = async (req, res) => {
  const ids = req.body.ids;
  const notification = req.body.notification;
  if (!notification || !ids) {
    return res.status(400).send({
      message: "notification and ids required",
      status: "error",
    });
  }
  try {
    let owners = await truckOwnerModel
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

const updateNotification = async (req, res) => {
  // if deleteNotification is true then delete the notification
  // else notification viewed will set to true
  const deleteNotification = req.body.deleteNotification; // boolean
  const truckOwnerId = req.params.truckOwnerId;
  const notificationId = req.params.notificationId;
  if (!truckOwnerId || !notificationId) {
    return res.status(400).send({
      message: "truckOwnerId and notificationId required",
      status: "error",
    });
  }
  if (deleteNotification) {
    try {
      let owner = await truckOwnerModel
        .findOneAndUpdate(
          { _id: truckOwnerId },
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
      let owner = await truckOwnerModel
        .findOneAndUpdate(
          {
            _id: truckOwnerId,
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
const getNotifications = async (req, res) => {
  const truckOwnerId = req.params.truckOwnerId;
  if (!truckOwnerId) {
    return res.status(400).send({
      message: "truckOwnerId required",
      status: "error",
    });
  }
  try {
    let owner = await truckOwnerModel
      .findById({ _id: truckOwnerId })
      .then((owner) => {
        return res.status(200).send({
          notifications: owner.notifications,
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

module.exports = {
  signup,
  signin,
  deactivateTruck,
  activateTruck,
  getTruckOwnerTrucks,
  updateBasicInfo,
  addNotification,
  updateNotification,
  getNotifications,
};
