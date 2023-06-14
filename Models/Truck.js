const mongoose = require("mongoose");
const { Schema } = mongoose;

const TruckSchema = new Schema({
  name: {
    type: String, // truck name
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
    type: String,
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
});

module.exports = mongoose.model("truck", TruckSchema);
