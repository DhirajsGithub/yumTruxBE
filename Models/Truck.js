const mongoose = require("mongoose");
const { Schema } = mongoose;

const TruckSchema = new Schema({
  name: {
    type: String, // truck name
  },
  category: {
    type: String,
  },
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  phoneNo: {
    type: String,
  },
  schedule: {
    type: Object,
  },
  latLong: {
    type: Object,
  },
  description: {
    type: String,
  },
  imgUrl: {
    type: Object,
  },
  address: {
    type: String,
  },
  timing: {
    type: String,
  },
  ratings: {
    type: Object,
  },
  menu: {
    type: Object,
  },
  paymentId: {
    type: String,
  },
  balance: {
    type: String,
  },
  paypalEmail: {
    type: String,
  },
  orders: {
    type: Object,
  },
  status: {
    type: String,
  },
  stripePaymentDate: {
    type: Date,
  },
});

module.exports = mongoose.model("truck", TruckSchema);
