const { getPost } = require("../Model/Post");
const { bloggs, bloggers } = require("../Utils/mongodb");

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

const updateUserProfile = async (user, name, lastname, dob, bio) => {
  try {
    const data = await bloggers.updateOne(
      { username: user },
      {
        $set: {
          name: name,
          lastName: lastname,
          dob: dob,
          bio: bio,
        },
      }
    );
    return data.matchedCount;
  } catch (error) {
    return error;
  }
};

const commentPost = async (id, user, response) => {
  const commentId = Date.now();
  const updateResponse = await bloggs.updateOne(
    { id: Number(id) },
    {
      $push: { comments: { username: user, comment: response, id: commentId } },
    }
  );
  return updateResponse;
};

module.exports = {
  checkandUpdate,
  checkandUpdateThumbsDown,
  updateUserProfile,
  commentPost,
};
