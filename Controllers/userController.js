const userModel = require("../Models/User");
const trucksModel = require("../Models/Truck");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uniqid = require("uniqid");
const { DeleteProfileImgCloudinary } = require("../utils/cloudinary");
const multer = require("multer");

const SECRET_KEY = "yumtruxsecret69";

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
      profileImg:
        "https://img.freepik.com/premium-vector/account-icon-user-icon-vector-graphics_292645-552.jpg",
      phoneNo: "",
      address: "",
      passwordResetToken: "",
      status: "active",
    });

    const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY);
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
    if (existingUser.status === "inactive") {
      return res.status(400).send({
        message: "Your account is not active, please contact admin",
        status: "error",
      });
    }
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
    const payload = { id: existingUser._id, email: existingUser.email };
    const secretKey = SECRET_KEY;

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
  const newObjectId = uniqid();
  try {
    const findUser = await userModel
      .findByIdAndUpdate(
        { _id: userId },
        { $push: { orderHistory: { ...order, orderId: newObjectId } } }
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

const date = new Date("2022-05-15T00:00:00.000Z");

const newDate = addDays(date, 5);

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
    const decoded = jwt.verify(token, SECRET_KEY);
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
};
