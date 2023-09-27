// from https://mongoosejs.com/
require("dotenv").config();
const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI;

// can also create a database just using /databse_name

const connectToMongo = () => {
  mongoose.connect(mongoURI).catch((error) => console.log(error));
};

module.exports = connectToMongo;
