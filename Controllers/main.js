const { getPost } = require("../Model/Post");
const { bloggs } = require("../Utils/mongodb");

const checkandUpdate = async (condition, id, user) => {
  if (!condition) {
    bloggs.updateOne({ _id: id }, { $push: { likers: { username: user } } });
    return { post: await getPost(id) };
  } else {
    bloggs.updateOne({ _id: id }, { $pull: { likers: { username: user } } });
    return { post: await getPost(id) };
  }
};
const likePost = async (id, user) => {
  const post = await getPost(id);
  let postLikers = post.likers;
  console.log(post);
  // const userLiked = postLikers.find((like) => like.username === user);
  // return checkandUpdate(userLiked, id, user);
};

module.exports = { likePost };
