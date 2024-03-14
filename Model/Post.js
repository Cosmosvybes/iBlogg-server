const { bloggs } = require("../Utils/mongodb");
const { config } = require("dotenv");
config();
const postSchemer = async (user, title, postBody, imageFile, senderPicture) => {
  try {
    const data = await bloggs.insertOne({
      id: Date.now(),
      title: title,
      picture: senderPicture,
      user: user,
      postBody: postBody,
      image: imageFile,
      date: new Date().toDateString("en-US"),
      time: new Date().toUTCString(),
      likers: [],
      thumbsdown: [],
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

async function getProfilePost(profileUsername) {
  const postData = await bloggs.find({ user: profileUsername }).toArray();
  return postData.length > 0 ? postData : "you don't have any post yet";
  // return postData;
}

module.exports = { postSchemer, allPost, getPost, getProfilePost };
