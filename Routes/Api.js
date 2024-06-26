// const cookieParser = require("cookie-parser");
const {
  postSchemer,
  allPost,
  getPost,
  getProfilePost,
  draftPost,
  deleteDraft,
} = require("../Model/Post");
const { userSchemer, getUser } = require("../Model/User");
const { uploadImage, userProfileUpload } = require("../Utils/cloudinary");
const {
  checkandUpdate,
  checkandUpdateThumbsDown,
  updateUserProfile,
  commentPost,
  readNotification,
  changePassword,
  updatePassword,
} = require("../Controllers/main");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { config } = require("dotenv");
const { bloggers } = require("../Utils/mongodb");
const { mailTransporter } = require("../Utils/Mailer");
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
            serverResponse: "success, post published!",
            data: postData,
          });
        } else {
          res
            .status(503)
            .send({ serverResponse: "internal error, try again." });
        }
      }
    } else if (!postBody || !title) {
      res.status(400).send({ response: "discription of your post is missing" });
    } else {
      let postData = await postSchemer(user, title, postBody, "", userPicture);
      if (postData) {
        res.status(200).send({
          serverResponse: "success, post published!",
          data: postData,
        });
      } else {
        res.status(503).send({ serverResponse: "internal erro, try again." });
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
        res.cookie("userToken", userToken, { maxAge: 36000000, path: "/api/" });
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
const commentOnPost = async (req, res) => {
  const { postId, user, response } = req.body;
  try {
    await commentPost(postId, user, response);
  } catch (error) {
    res.status(503).send({ response: error });
  }
};

const readNotificationApi = async (req, res) => {
  const user = req.user.payload;
  const { notificationId } = req.body;
  try {
    await readNotification(user, notificationId);
  } catch (error) {
    res.status(503).send({ res: error });
  }
};

const ForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const code = Date.now();
    let verifictionCode = String(code).slice(8, 13);
    const getUserResponse = await changePassword(email, verifictionCode);
    if (!getUserResponse.token) {
      res.send({ response: getUserResponse });
    } else {
      res.cookie("passToken", getUserResponse.token, {
        maxAge: 3600000,
        path: "/api/",
      });
      mailTransporter.sendMail({
        sender: "FxTa",
        from: "FxTa",
        subject: "FxTa Verification code",
        to: email,
        html: `<div  style='display:block, text-align:center; height:auto;'> <p  style='text-align:center;'> Your password recovery verification code is </p> <h1 style='text-align:center;'> ${verifictionCode} </h1>  </div>`,
      });
      res.send({
        isValid: true,
        response: `Verification code has been sent to ${email}`,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
const verifyCode = async (req, res) => {
  const code = req.user.verificationCode;
  const { requestCode } = req.body;
  try {
    if (code == requestCode) {
      res.status(200).send({ response: "verification successful" });
    } else {
      res.status(403).send({ response: "invalid verification" });
    }
  } catch (error) {
    console.log(error);
  }
};

const UpdateUserPassword = async (req, res) => {
  const user = req.user.user;
  const { password } = req.body;
  let saltRound = 10;
  const encryptedPassword = await bcrypt.hash(password, saltRound);
  try {
    const response = await updatePassword(user, encryptedPassword);
    if (response.modifiedCount === 1)
      res.status(200).send({ response: "password successfully changed" });
  } catch (error) {
    res.status(503).send({ response: "internal error" });
  }
};
const postToDraft = async (req, res) => {
  const user = req.user.payload;
  const { postBody, title } = req.body;
  try {
    const response = await draftPost(user, title, postBody);
    if (response.modifiedCount == 1) {
      res.status(200).send({ response: "post successfully drafted" });
    } else {
      res.status(503).send({ response: "operation failed, try again" });
    }
  } catch (error) {
    res.status(500).send({ response: error });
  }
};

const deleteDraftPost = async (req, res) => {
  const user = req.user.payload;
  const { id } = req.body;
  try {
    const response = await deleteDraft(user, id);

    if (response.matchedCount === 1) {
      res.status(200).send({ response: "post deleted" });
    }
  } catch (error) {
    res.status(500).send({ response: "error occured" });
  }
};

module.exports = {
  deleteDraftPost,
  postToDraft,
  UpdateUserPassword,
  verifyCode,
  ForgotPassword,
  readNotificationApi,
  commentOnPost,
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
