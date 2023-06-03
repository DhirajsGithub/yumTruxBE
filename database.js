// from https://mongoosejs.com/
const mongoose = require("mongoose");

const mongoURI =
  "mongodb+srv://yumtruk:3CRh3UJMg6RIosYf@cluster0.tzdsj.mongodb.net/YumTruks";

// can also create a database just using /databse_name

const connectToMongo = () => {
  mongoose.connect(mongoURI).catch((error) => console.log(error));
};

module.exports = connectToMongo;
