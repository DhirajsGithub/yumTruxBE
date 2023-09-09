const truckOwnerModel = require("../Models/TruckOwner");
const trucksModel = require("../Models/Truck");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/SendMail");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const SECRET_KEY = "yumtruxsecret69";

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
        imgUrl:
          "https://res.cloudinary.com/dk8hyxr2z/image/upload/v1685710777/yumtrux_users/defaultProfileImg_rrndub.webp",
        address: "",
        ownTrucks: [],
        passwordResetToken: "",
        joinOn: new Date(),
      });

      const token = jwt.sign(
        { email: result.email, id: result._id },
        SECRET_KEY,
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
        SECRET_KEY,
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

module.exports = {
  signup,
  signin,
  deactivateTruck,
  activateTruck,
  getTruckOwnerTrucks,
  updateBasicInfo,
};
