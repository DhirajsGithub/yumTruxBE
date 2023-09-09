const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdminSchems = new Schema({
  name: {
    type: String, // truck name
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
  categories: {
    type: Object,
  },
  paymentId: {
    type: String,
  },
  payments: {
    type: Object,
  },
  MonthlyPriceData: {
    type: Object,
  },
  notifications: {
    type: Object,
  },
});

module.exports = mongoose.model("admin", AdminSchems);
