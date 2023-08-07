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
  imgUrl: {
    type: Object,
  },
  address: {
    type: String,
  },
  ownTrucks: {
    type: Object,
  },
});

module.exports = mongoose.model("truck", TruckSchema);
