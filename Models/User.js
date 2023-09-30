// from https://mongoosejs.com/docs/guide.html

const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  fullName: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  date: {
    type: Date,
  },
  username: {
    type: String,
    unique: true,
  },
  favouriteTrucks: {
    type: Object,
  },
  orderHistory: {
    type: Object,
  },
  profileImg: {
    type: String,
  },
  phoneNo: {
    type: String,
  },
  address: {
    type: String,
  },
  passwordResetToken: {
    type: String,
  },
  status: {
    type: String,
  },
  notifications: {
    type: Object,
  },
  expoPushToken: {
    type: String,
  },
  paymentDetails: {
    type: Object,
  },
});

module.exports = mongoose.model("user", UserSchema);
