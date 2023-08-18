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
        passwordResetToken: "",
        imgUrl: "",
        address: "",
        ownTrucks: [],
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
        message: "email, password, username, address, phone number required",
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
        truckData: existingTruckOwner,
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
            if (trucks?.length === 0) {
              return res.status(201).send({
                trucks: trucks,
                message: "please check email or add truck",
                status: "success",
              });
            }
            return res
              .status(201)
              .send({ trucks: trucks, message: "success", status: "success" });
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

module.exports = {
  signup,
  signin,
  deactivateTruck,
  activateTruck,
  getTruckOwnerTrucks,
};
