const { uploadImage } = require("../Utils/cloudinary");
const createPost = async (req, res) => {
  const imageFile = req.file;
  const { postBody } = req.body;
  try {
    if (imageFile && postBody) {
      let cloudUploadResponse = await uploadImage(imageFile.path);
      res.status(200).send({
        serverResponse: "Image-file and text received",
        data: { cloudUploadResponse, postBody },
      });
    }
  } catch (error) {
    res.status(500).send({ response: "internal error" });
  }
};
module.exports = { createPost };
