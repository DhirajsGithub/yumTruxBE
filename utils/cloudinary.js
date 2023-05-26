const uploadProfileImg = async (imgPath, userId) => {
  const cloudinary = require("cloudinary").v2;
  console.log(imgPath);

  // Configuration
  cloudinary.config({
    cloud_name: "dk8hyxr2z",
    api_key: "361878934813333",
    api_secret: "l3qV7X-1GZQ_4LZPUppUzOezgic",
  });

  // Upload

  const res = cloudinary.uploader.upload(imgPath, { public_id: userId });

  res
    .then((data) => {
      console.log(data);
      console.log(data.secure_url);
    })
    .catch((err) => {
      console.log(err);
    });

  // Generate
  const url = cloudinary.url("olympic_flag", {
    width: 200,
    height: 200,
    // Crop: "size",
  });

  // The output url
  console.log(url);
  // https://res.cloudinary.com/<cloud_name>/image/upload/h_150,w_100/olympic_flag
};

module.exports = { uploadProfileImg };
