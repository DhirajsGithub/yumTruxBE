// const fetch = require("node-fetch");
const otpGenerator = require("otp-generator");
const truckOwnerModel = require("../Models/TruckOwner");
const bcrypt = require("bcrypt");
const { PasswordResetMail } = require("../utils/PasswordResetMail");
const userModel = require("../Models/User");

const getReqeuest = async (req, res) => {
  return res.send("Welcome to YumTrux :) \nWe are here for your serving 3");
};

const sample = async (req, res) => {
  try {
    let r = await fetch("https://jsonplaceholder.typicode.com/posts/2");
    r = await r.json();
    return res.status(200).send(r);
  } catch (error) {
    return res.status(200).send(error);
  }
};

// /generalRoutes/sendEmailForPasswordReset
const sendEmailForPasswordReset = async (req, res) => {
  const email = req.body.email;
  const userOrTruck = req.body.userOrTruck;
  const generatedOtp = otpGenerator.generate(5, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  if (email?.length > 0 && userOrTruck?.length > 0) {
    try {
      if (userOrTruck === "truckOwner") {
        const findTruck = await truckOwnerModel
          .findOneAndUpdate({ email }, { passwordResetToken: generatedOtp })
          .then((truck) => {
            if (truck) {
              let info = PasswordResetMail(email, generatedOtp);
              return res.status(200).send({
                message: "Email sent successfully",
                status: "success",
                email,
              });
            } else {
              return res
                .status(400)
                .send({ message: "Couldn't find the truck", status: "error" });
            }
          });
      } else {
        const findUser = await userModel
          .findOneAndUpdate({ email }, { passwordResetToken: generatedOtp })
          .then((user) => {
            if (user) {
              let info = PasswordResetMail(email, generatedOtp);
              return res.status(200).send({
                message: "Email sent successfully",
                status: "success",
                email,
              });
            } else {
              return res
                .status(400)
                .send({ message: "Couldn't find the user", status: "error" });
            }
          });
      }
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  } else {
    return res.status(400).send({
      message: "Require email and user or truck field",
      status: "error",
    });
  }
};

// /passwordReset
const passwordReset = async (req, res) => {
  const email = req.body.email;
  const inputOtp = req.body.inputOtp;
  const newPassword = req.body.newPassword;
  const userOrTruck = req.body.userOrTruck;
  if (newPassword?.length < 4 || email?.length === 0) {
    return res.status(400).send({
      message: "please provide strong password and email",
      status: "error",
    });
  }
  try {
    if (userOrTruck === "truckOwner") {
      const truckOwner = truckOwnerModel
        .findOne({ email })
        .then(async (truckOwner) => {
          if (truckOwner) {
            const fetchedOtp = truckOwner?.passwordResetToken;
            if (fetchedOtp === inputOtp) {
              const hashPass = await bcrypt.hash(newPassword, 8);
              let doc = await truckOwnerModel.findOneAndUpdate(
                { email },
                { password: hashPass }
              );
              if (doc) {
                return res.status(200).send({
                  message: "Password successfully updated",
                  status: "success",
                  email,
                });
              }
            } else {
              return res.status(400).send({
                message: "Verification code doesn't match",
                status: "error",
              });
            }
          } else {
            return res.status(400).send({
              message: "truck owner not found with provided email",
              status: "error",
            });
          }
        })
        .catch((err) => {
          return res.status(400).send({
            message: err.message,
            status: "error",
          });
        });
    } else {
      const user = userModel
        .findOne({ email })
        .then(async (user) => {
          if (user) {
            const fetchedOtp = user?.passwordResetToken;
            if (fetchedOtp === inputOtp) {
              const hashPass = await bcrypt.hash(newPassword, 8);
              let doc = await userModel.findOneAndUpdate(
                { email },
                { password: hashPass }
              );
              if (doc) {
                return res.status(200).send({
                  message: "Password successfully updated",
                  status: "success",
                  email,
                });
              }
            } else {
              return res.status(400).send({
                message: "Verification code doesn't match",
                status: "error",
              });
            }
          } else {
            return res.status(400).send({
              message: "truck owner not found with provided email",
              status: "error",
            });
          }
        })
        .catch((err) => {
          return res.status(400).send({
            message: err.message,
            status: "error",
          });
        });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = {
  getReqeuest,
  sample,
  passwordReset,
  sendEmailForPasswordReset,
};
