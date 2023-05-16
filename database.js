// from https://mongoosejs.com/
const mongoose = require("mongoose");

const mongoURI = "mongodb://localhost:27017/yumtrux";

// can also create a database just using /databse_name

const connectToMongo = () => {
  mongoose.connect(mongoURI).catch((error) => console.log(error));
};

module.exports = connectToMongo;
