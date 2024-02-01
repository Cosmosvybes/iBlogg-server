const cloudinary = require("cloudinary").v2;
const uploadImage = (img) => {
  const responseUrl = cloudinary.image(img, {
    width: 400,
    height: 400,
    crop: "fill",
  });
  return { responseUrl };
};

module.exports = { uploadImage };
