// from https://mongoosejs.com/
const mongoose = require("mongoose");

const mongoURI =
  "mongodb+srv://yumtruxdeveloper:qTApdZWfUX5zWJYE@yumtrux.tjvv0yt.mongodb.net/?retryWrites=true&w=majority";

// can also create a database just using /databse_name

const connectToMongo = () => {
  mongoose.connect(mongoURI).catch((error) => console.log(error));
};

module.exports = connectToMongo;
