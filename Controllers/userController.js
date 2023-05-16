const userModel = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "yumtruxsecret69";

const reqDate = new Date();

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
      date: reqDate.toLocaleDateString(),
      fullName: "",
      favouriteTrucks: [],
      orderHistory: [],
      promileImg: "",
      phoneNo: 0,
      address: "",
    });

    const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY);
    return res.status(201).json({ user: result, token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
const signin = async (req, res) => {
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

module.exports = { signin, signup };
