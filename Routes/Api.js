// const cookieParser = require("cookie-parser");
const {
  postSchemer,
  allPost,
  getPost,
  getProfilePost,
} = require("../Model/Post");
const { userSchemer, getUser } = require("../Model/User");
const { uploadImage, userProfileUpload } = require("../Utils/cloudinary");
const {
  checkandUpdate,
  checkandUpdateThumbsDown,
  updateUserProfile,
} = require("../Controllers/main");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { config } = require("dotenv");
const { bloggers } = require("../Utils/mongodb");
config();

//create new post function
const createPost = async (req, res) => {
  const imageFile = req.file;
  const user = req.user.payload;
  const { postBody, title, userPicture } = req.body;

  try {
    if (imageFile) {
      let cloudUploadResponse = await uploadImage(imageFile.path);
      if (cloudUploadResponse && postBody) {
        let postData = await postSchemer(
          user,
          title,
          postBody,
          cloudUploadResponse,
          userPicture
        );
        if (postData) {
          res.status(200).send({
            serverResponse: "success, your post has been published!",
            data: postData,
          });
        }
      }
    } else if (!postBody || !title) {
      res.status(400).send({ response: "discription of your post is missing" });
    } else {
      let postData = await postSchemer(user, title, postBody, "", userPicture);
      if (postData) {
        res.status(200).send({
          serverResponse: "success, your post has been published!",
          data: postData,
        });
      }
    }
  } catch (error) {
    res.status(500).send({ error });
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

const profile = async (req, res) => {
  const username = req.user.payload;
  try {
    const userData = await getUser(username);
    const posts = await getProfilePost(username);
    if (userData) {
      res.status(200).send({ userData, posts });
    }
  } catch (error) {
    res.status(401).send({ response: "operation failed", error });
  }
};

const signUp = async (req, res) => {
  const { firstname, lastname, email, password, username } = req.body;
  try {
    let existUsername = await getUser(username);
    if (existUsername) {
      res
        .status(403)
        .send({ response: `username ${username} exist use a new name` });
    } else {
      const data = await userSchemer(
        firstname,
        lastname,
        email,
        password,
        username
      );
      res.send({ response: "account succesfully created", data });
    }
  } catch (error) {
    res.send({ error });
  }
};

const signIn = async (req, res) => {
  const { username, password } = req.body;

  try {
    const userData = await getUser(username);
    if (userData) {
      let isAuthorized = await bcrypt.compare(password, userData.password);
      if (isAuthorized) {
        const userToken = jwt.sign(
          { payload: userData.username },
          process.env.api_secret
        );
        res.cookie("userToken", userToken, { maxAge: 3600000, path: "/api/" });
        res.redirect(302, "/api/profile");
      } else {
        res.status(403).send({ response: "incorrect password" });
      }
    } else {
      res.status(404).send({ response: "user not found" });
    }
  } catch (error) {
    res.status(401).send({ response: "operation failed", error });
  }
};

const thumbsUp = async (req, res) => {
  const { id, user } = req.body;
  try {
    const post = await getPost(Number(id));
    let likers = post.likers;
    let isLikedByUser = await likers.find((liker) => {
      return liker.username == user;
    });
    let response = await checkandUpdate(
      isLikedByUser ? true : false,
      post.id,
      user
    );
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ response: "internal error", error });
  }
};

const thumbsDown = async (req, res) => {
  const { id, user } = req.body;
  try {
    const post = await getPost(Number(id));
    let disLikers = post.thumbsdown;
    let isThumbedDown = await disLikers.find((disliker) => {
      return disliker.username == user;
    });
    let response = await checkandUpdateThumbsDown(
      isThumbedDown ? true : false,
      post.id,
      user
    );
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ response: "internal error", error });
  }
};

const updateProfilePicture = async (req, res) => {
  const user = req.user.payload;
  const imageFile = req.file;
  try {
    const uploadResponse = await userProfileUpload(imageFile.path);
    const updateAccount = await bloggers.updateOne(
      { username: user },
      { $set: { profilePicture: uploadResponse } }
    );
    res.status(200).send({
      response: "picture successfully uploaded",
      ack: updateAccount.modifiedCount,
    });
  } catch (error) {
    res.status(503).send({ response: "internal error, try again" });
  }
};

const updateProfile = async (req, res) => {
  const user = req.user.payload;
  const { name, lastName, dob, bio } = req.body;
  try {
    const userAccount = await getUser(user);
    const updateResponse = await updateUserProfile(
      userAccount.username,
      name,
      lastName,
      dob,
      bio
    );

    if (updateResponse) {
      res.status(200).send({ response: "profile successfully updated" });
    }
  } catch (error) {
    console.log(error);
  }
};

// const profilePost = async (req, res) => {
//   const username = req.params.username;
//   try {
//     const posts = await getProfilePost(username);
//     res.status(200).send(posts);
//   } catch (error) {
//     res.status(500).send({ err: error });
//   }
// };

module.exports = {
  createPost,
  getPosts,
  profile,
  signIn,
  signUp,
  thumbsUp,
  thumbsDown,
  updateProfile,
  updateProfilePicture,
};
