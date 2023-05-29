const uploadProfileImg = async (imgPath, userId) => {
  const cloudinary = require("cloudinary").v2;

  // Configuration
  cloudinary.config({
    cloud_name: "dk8hyxr2z",
    api_key: "361878934813333",
    api_secret: "l3qV7X-1GZQ_4LZPUppUzOezgic",
  });

  // Upload

  // try {
  //   let res = await cloudinary.uploader.upload(
  //     "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aHVtYW58ZW58MHx8MHx8fDA%3D&w=1000&q=80",
  //     { public_id: userId, folder: "yumtrux_users", use_filename: false }
  //   );
  //   console.log(res);
  //   return res.secure_url;
  // } catch (error) {
  //   console.log(error);
  // }

  // Generate
  // const url = cloudinary.url("yumtrux_users/" + userId, {
  //   width: 200,
  //   height: 200,
  //   format: "auto",
  //   Crop: "size",
  //   quality: "80",
  // });

  // The output url
  // console.log(url);
  // https://res.cloudinary.com/<cloud_name>/image/upload/h_150,w_100/olympic_flag
};

module.exports = { uploadProfileImg };
