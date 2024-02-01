const createPost = async (req, res) => {
  const imageFile = req.file;
  const { postBody } = req.body;
  console.log(imageFile, postBody);
};
module.exports = { createPost };
