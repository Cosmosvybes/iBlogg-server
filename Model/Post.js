const { bloggs } = require("../Utils/mongodb");
const postSchemer = async (user, title, postBody, imageFile) => {
  try {
    const data = await bloggs.insertOne({
      id: Date.now(),
      title:title,
      user: user,
      postBody: postBody,
      image: imageFile,
      date: new Date().toDateString("en-US"),
      time: new Date().toTimeString("en-Us"),
      likers: [],
      fireMakers: [],
      comments: [],
    });
    return data.insertedId
      ? { data: await getPost(data.id) }
      : { response: "operation failed!" };
  } catch (error) {
    return { error };
  }
};

const getPost = async (id) => {
  let postData = await bloggs.findOne({ id: id });
  return postData;
};

const allPost = async () => {
  let postsData = await bloggs.find({}).toArray();
  return postsData;
};

module.exports = { postSchemer, allPost, getPost };
