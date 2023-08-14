require("dotenv").config();
const DeleteProfileImgCloudinary = async (userId) => {
  const cloudinary = require("cloudinary").v2;

  // Configuration
  cloudinary.config({
    cloud_name: "dk8hyxr2z",
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Upload

  try {
    let p = await cloudinary.uploader.destroy(
      "yumtrux_users/" + userId,
      function (err, result) {
        return result;
      }
    );
    return p;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { DeleteProfileImgCloudinary };
