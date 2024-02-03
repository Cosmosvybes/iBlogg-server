const multer = require("multer");
const upload = multer({ dest: "images/" });

const uploadImage = () => {
  const uploadResponse = upload.single("image");
  return uploadResponse;
};
module.exports = { uploadImage };
