const { bloggs } = require("../Utils/mongodb");
const postSchemer = async (user, postBody, imageFile) => {
  try {
    const data = await bloggs.insertOne({
      user: user,
      postBody: postBody,
      image: imageFile,
      date: new Date().toDateString("en-US"),
      time: new Date().toTimeString("en-Us"),
      likes: 0,
      likers: [],
      fireMakers: [],
      comments: [],
      fire: 0,
    });
    return data.insertedId
      ? { data: await getPost(data.insertedId) }
      : { response: "operation failed!" };
  } catch (error) {
    return { error };
  }
};

const getPost = async (id) => {
  let postData = await bloggs.findOne({ _id: id });
  return postData;
};

const allPost = async () => {
  let postsData = await bloggs.find({}).toArray();
  return postsData;
};

module.exports = { postSchemer, allPost, getPost };
