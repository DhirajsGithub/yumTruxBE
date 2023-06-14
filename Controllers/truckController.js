// /truck/signup
const trucksModel = require("../Models/Truck");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uniqid = require("uniqid");
const SECRET_KEY = "yumtruxsecret69";

const signup = async (req, res) => {
  const { email, username, password, phoneNo, address } = req.body;
  try {
    const existingTruck = await trucksModel.findOne({
      // username and email both should be unique
      $or: [{ email: email }],
    });
    if (existingTruck) {
      return res
        .status(400)
        .json({ message: "User already exist", status: "error" });
    }

    const hashPass = await bcrypt.hash(password, 8);

    const result = await trucksModel.create({
      name: "",
      username,
      password: hashPass,
      email,
      phoneNo,
      schedule: [],
      latLong: [],
      description: "",
      imgUrl: "",
      address,
      timing: "",
      ratings: [],
      menu: [],
      paymentId: "",
      balance: "",
    });

    const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY);
    return res.status(201).json({
      truckData: result,
      token,
      message: "Account created successfully",
      status: "success",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", status: "error" });
  }
};

// /truck/signin
const signin = async (req, res) => {
  // can think of login with email or username as well
  const { email, password } = req.body;

  try {
    const existingTruck = await trucksModel.findOne({
      email: email,
    });
    if (!existingTruck) {
      return res
        .status(404)
        .json({ message: "User not found", status: "error" });
    }

    const matchPassword = await bcrypt.compare(
      password,
      existingTruck.password
    );
    if (!matchPassword) {
      return res
        .status(400)
        .json({ message: "Password doesn't match", status: "error" });
    }
    const token = jwt.sign(
      { email: existingTruck.email, id: existingTruck._id },
      SECRET_KEY
    );
    return res.status(201).json({
      truckData: existingTruck,
      token,
      status: "success",
      message: "Successfully login",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", status: "success" });
  }
};

module.exports = { signup, signin };
