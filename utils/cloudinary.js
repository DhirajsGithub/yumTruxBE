const DeleteProfileImgCloudinary = async (userId) => {
  const cloudinary = require("cloudinary").v2;

  // Configuration
  cloudinary.config({
    cloud_name: "dk8hyxr2z",
    api_key: "361878934813333",
    api_secret: "l3qV7X-1GZQ_4LZPUppUzOezgic",
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
