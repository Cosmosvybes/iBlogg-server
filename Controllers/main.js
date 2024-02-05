const { getPost } = require("../Model/Post");
const { bloggs } = require("../Utils/mongodb");

const checkandUpdate = async (condition, id, user) => {
  if (!condition) {
    await bloggs.updateOne(
      { id: id },
      { $push: { likers: { username: user } } }
    );
    return { post: await getPost(Number(id)) };
  } else {
    await bloggs.updateOne(
      { id: id },
      { $pull: { likers: { username: user } } }
    );
    return { post: await getPost(Number(id)) };
  }
};
const checkandUpdateThumbsDown = async (condition, id, user) => {
  if (!condition) {
    await bloggs.updateOne(
      { id: id },
      { $push: { thumbsdown: { username: user } } }
    );
    return { post: await getPost(Number(id)) };
  } else {
    await bloggs.updateOne(
      { id: id },
      { $pull: { thumbsdown: { username: user } } }
    );
    return { post: await getPost(Number(id)) };
  }
};

module.exports = { checkandUpdate, checkandUpdateThumbsDown };
