const { bloggs, bloggers } = require("../Utils/mongodb");
const { config } = require("dotenv");
const { getUser } = require("./User");
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
const draftPost = async (user, title, postBody) => {
  const draftResponse = await bloggers.updateOne(
    { username: user },
    {
      $push: {
        drafts: {
          id: Date.now(),
          user: user,
          title: title,
          postBody: postBody,
        },
      },
    }
  );
  return draftResponse;
};

const deleteDraft = async (username, id) => {
  const user = await getUser(username);
  const getPost = user.drafts.find((post) => post.id == Number(id));
  const deleteReponse = bloggers.updateOne(
    { username: username },
    { $pull: { drafts: getPost } }
  );
  return deleteReponse;
};

module.exports = {
  deleteDraft,
  postSchemer,
  allPost,
  getPost,
  getProfilePost,
  draftPost,
};
