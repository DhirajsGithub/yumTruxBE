const mongoose = require("mongoose");
const { Schema } = mongoose;

const TruckOwnerSchema = new Schema({
  name: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  phoneNo: {
    type: String,
  },
  imgUrl: {
    type: Object,
  },
  address: {
    type: String,
  },
  ownTrucks: {
    type: Object,
  },
  passwordResetToken: {
    type: String,
  },
});

module.exports = mongoose.model("truckOwner", TruckOwnerSchema);
