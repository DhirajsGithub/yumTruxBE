const userModel = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uniqid = require("uniqid");
const { uploadProfileImg } = require("../utils/cloudinary");

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
      return res.status(400).json({ message: "User already exist" });
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
      profileImg: "",
      phoneNo: "",
      address: "",
    });

    const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY);
    return res
      .status(201)
      .json({ user: result, token, message: "Account created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
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
      return res.status(404).json({ message: "User not found" });
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password);
    if (!matchPassword) {
      return res.status(400).json({ message: "Password doesn't match" });
    }
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      SECRET_KEY
    );
    return res.status(201).json({ user: existingUser, token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
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
        return res
          .status(201)
          .send("successfully added order to order history");
      })
      .catch((err) => {
        return res.status(400).send("Couldn't find the user");
      });
  } catch (error) {
    return res.status(500).send("Cannot add order at this moment");
  }
};

// /updateUser/:userId
const updateUser = async (req, res) => {
  const fullName = req.body.fullName;
  const phoneNo = req.body.phoneNo;
  const address = req.body.address;
  const profileImg = req.body.profileImg;
  const userId = req.params.userId;
  let uploadedImg = uploadProfileImg(profileImg, userId);

  try {
    const findUser = await userModel
      .findByIdAndUpdate(
        { _id: userId },
        { fullName, phoneNo, address, profileImg: uploadedImg }
      )
      .then((user) => {
        return res.status(201).send("Successfully updated user");
      })
      .catch((err) => {
        return res.status(400).send("Couldn't find the user");
      });
  } catch (error) {
    return res.status(500).send("Cannot update user at this moment");
  }
};

// userDetails/:userId
const userDetails = async (req, res) => {
  const userId = req.params.userId;
  try {
    const findUser = await userModel
      .findById({ _id: userId })
      .then((user) => {
        return res.status(201).send(user);
      })
      .catch((err) => {
        return res.status(400).send("Couldn't find the user");
      });
  } catch (error) {
    return res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = { signin, signup, orderHistory, updateUser, userDetails };
