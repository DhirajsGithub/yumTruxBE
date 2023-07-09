// /truck/signup
const trucksModel = require("../Models/Truck");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uniqid = require("uniqid");
const { sendMail } = require("../utils/SendMail");
const SECRET_KEY = "yumtruxsecret69";
const { PasswordResetMail } = require("../utils/PasswordResetMail");
const otpGenerator = require("otp-generator");

// /truck/signup
const signup = async (req, res) => {
  const { email, username, password, phoneNo, address } = req.body;
  try {
    if (
      email?.length > 0 &&
      username?.length > 0 &&
      password?.length > 0 &&
      address?.length > 0 &&
      phoneNo
    ) {
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
        imgUrl: [],
        address,
        timing: "",
        ratings: [],
        menu: [],
        paymentId: "",
        balance: "",
      });

      const token = jwt.sign(
        { email: result.email, id: result._id },
        SECRET_KEY,
        { expiresIn: "2d" }
      );
      return res.status(201).json({
        truckData: result,
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
    if (email?.length > 0 && password?.length > 0) {
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
        SECRET_KEY,
        { expiresIn: "2d" }
      );
      sendMail(existingTruck.email, existingTruck.username);
      return res.status(201).json({
        truckData: existingTruck,
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
//truckDetails
const truckDetails = async (req, res) => {
  const userId = req.params.truckId;
  try {
    const findUser = await trucksModel
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

// /truck/upateBasicData/:truckId
const upateBasicData = async (req, res) => {
  const truckId = req.params.truckId;
  const name = req.body.name;
  const description = req.body.description;
  const timing = req.body.timing;
  try {
    if (name?.length > 0 && description?.length > 0 && timing?.length > 0) {
      const findTruck = await trucksModel
        .findByIdAndUpdate({ _id: truckId }, { name, description, timing })
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully updated truck basic data",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res.status(400).send({
        message: "required truck name, description, image url, timing",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Cannot update truck data at this moment",
      status: "error",
    });
  }
};

// truck/updateTruckImgs/:truckId
const updateTruckImgs = async (req, res) => {};

// /truck/addSchedule/:truckId
const addSchedule = async (req, res) => {
  const truckId = req.params.truckId;
  const dateObj = req.body.dateObj;
  const locations = req.body.locations;
  const scheduleId = uniqid();
  try {
    if (locations?.length > 0 && dateObj) {
      const findTruck = await trucksModel
        .findByIdAndUpdate(
          { _id: truckId },
          { $push: { schedule: { dateObj, locations, scheduleId } } }
        )
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully added truck schedule",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res.status(400).send({
        message: "required schedule array and date object",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Cannot update truck schedule at this moment",
      status: "error",
    });
  }
};

// /truck/deleteSchedule/:truckId/
const deleteSchedule = async (req, res) => {
  const truckId = req.params.truckId;
  const scheduleId = req.body.scheduleId;
  try {
    if (scheduleId?.length > 0) {
      const findTruck = await trucksModel
        .findByIdAndUpdate(
          { _id: truckId },
          { $pull: { schedule: { scheduleId } } }
        )
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully deleted truck schedule",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res
        .status(400)
        .send({ message: "required schedule id", status: "error" });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Cannot delete truck schedule at this moment",
      status: "error",
    });
  }
};

// /truck/addTruckMenu/:truckId/
const addTruckMenu = async (req, res) => {
  const truckId = req.params.truckId;
  const name = req.body.name;
  const price = req.body.price;
  const description = req.body.description;
  const imgUrl = req.body.imgUrl;
  const id = uniqid();

  try {
    if (name?.length > 0 && price && description?.length > 0) {
      const findTruck = await trucksModel
        .findByIdAndUpdate(
          { _id: truckId },
          { $push: { menu: { name, price, description, imgUrl, id } } }
        )
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully added truck menu",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(201)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res.status(201).send({
        message: "required name, price and description of menu",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(201).send({
      message: "Cannot add truck menu at this moment",
      status: "error",
    });
  }
};

// /truck/deleteTruckMenu/:truckId/
const deleteTruckMenu = async (req, res) => {
  const truckId = req.params.truckId;
  const id = req.body.menuId;
  try {
    if (id?.length > 0) {
      const findTruck = await trucksModel
        .findByIdAndUpdate({ _id: truckId }, { $pull: { menu: { id } } })
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully de§leted truck menu",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res
        .status(400)
        .send({ message: "required id of menu", status: "error" });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Cannot delete truck menu at this moment",
      status: "error",
    });
  }
};

// /truck/updatePaymentId/:truckId
const updateStripePaymentId = async (req, res) => {
  const truckId = req.params.truckId;
  const paymentId = req.body.paymentId;
  try {
    if (paymentId?.length > 0) {
      const findTruck = await trucksModel
        .findByIdAndUpdate({ _id: truckId }, { paymentId })
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully updated payment id of truck",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res.status(400).send({
        message: "required payment id",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// /truck/updatePaypalEmail/:truckId
const updatePaypalEmail = async (req, res) => {
  const truckId = req.params.truckId;
  const paypalEmail = req.body.paypalEmail;
  try {
    if (paypalEmail?.length > 0) {
      const findTruck = await trucksModel
        .findByIdAndUpdate({ _id: truckId }, { paypalEmail })
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully updated paypal email of truck",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res.status(400).send({
        message: "required paypal email id",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// /sendEmailForPasswordReset
const sendEmailForPasswordReset = async (req, res) => {
  const email = req.body.email;
  if (email?.length > 0) {
    try {
      const findTruck = await trucksModel.findOne({ email }).then((truck) => {
        if (truck) {
          const generatedOtp = otpGenerator.generate(5, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
          });
          let info = PasswordResetMail(email, generatedOtp);
          return res.status(200).send({
            message: "Email sent successfully",
            status: "success",
            email,
            generatedOtp,
          });
        } else {
          return res
            .status(400)
            .send({ message: "Couldn't find the truck", status: "error" });
        }
      });
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  } else {
    return res.status(400).send({ message: "Require email", status: "error" });
  }
};

// /passwordReset
const passwordReset = async (req, res) => {
  const generatedOtp = req.body.generatedOtp;
  const email = req.body.email;
  const inputOtp = req.body.inputOtp;
  const newPassword = req.body.newPassword;
  try {
    if (inputOtp === generatedOtp) {
      if (newPassword?.length > 0 && email?.length > 0) {
        const hashPass = await bcrypt.hash(newPassword, 8);
        let doc = await trucksModel.findOneAndUpdate(
          { email },
          { password: hashPass }
        );

        if (doc) {
          return res.status(200).send({
            message: "Password successfully updated",
            status: "error",
          });
        } else {
          return res.status(400).send({
            message: "Couldn't find the truck",
            status: "error",
          });
        }
      } else {
        return res.status(400).send({
          message: "please provide password and email",
          status: "error",
        });
      }
    } else {
      return res.status(400).send({
        message: "Verification code doesn't match",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// /truck/addOrderToTruck/:truckId
const addOrderToTruck = async (req, res) => {
  let truckId = req.params.truckId;
  const order = req.body.order;
  if (truckId?.length > 0) {
    if (order) {
      try {
        const findTruck = await trucksModel
          .findByIdAndUpdate({ _id: truckId }, { $push: { orders: order } })
          .then((truck) => {
            return res.status(201).send({
              message: "Successfully added order to truck",
              status: "success",
            });
          })
          .catch((err) => {
            return res.status(201).send({
              message: "couldn't find the truck",
              status: "error",
            });
          });
      } catch (error) {
        return res.status(500).send({ error: error.message });
      }
    } else {
      return res
        .status(400)
        .send({ message: "required order", status: "error" });
    }
  } else {
    return res
      .status(400)
      .send({ message: "required truck id", status: "error" });
  }
};

module.exports = {
  signup,
  signin,
  upateBasicData,
  addSchedule,
  deleteSchedule,
  addTruckMenu,
  deleteTruckMenu,
  updateStripePaymentId,
  updatePaypalEmail,
  passwordReset,
  sendEmailForPasswordReset,
  truckDetails,
  addOrderToTruck,
};
