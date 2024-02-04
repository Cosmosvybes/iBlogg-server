const { postSchemer, allPost } = require("../Model/Post");
const { uploadImage } = require("../Utils/cloudinary");
const createPost = async (req, res) => {
  const imageFile = req.file;
  const { postBody } = req.body;
  try {
    if (imageFile || postBody) {
      let cloudUploadResponse = await uploadImage(imageFile.path);
      if (cloudUploadResponse) {
        let postData = await postSchemer(
          "cosmos",
          postBody,
          cloudUploadResponse
        );
        if (postData) {
          res.status(200).send({
            serverResponse: "success, your post has been published!",
            data: postData,
          });
        } else {
          res.status(500).send({ response: "internal error, try again!" });
        }
      }
    }
  } catch (error) {
    res.status(500).send({ response: "internal error" });
  }
};

const getPosts = async (req, res) => {
  try {
    const data = await allPost();
    if (data) {
      res.status(200).send({ data });
    }
  } catch (error) {
    res.status(503).send({ response: "service unavailable" });
  }
};

module.exports = { createPost, getPosts };
