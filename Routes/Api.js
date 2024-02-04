// const cookieParser = require("cookie-parser");
const { postSchemer, allPost } = require("../Model/Post");
const { existUser, userSchemer } = require("../Model/User");
const { uploadImage } = require("../Utils/cloudinary");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { config } = require("dotenv");
config();

//create new post function
const createPost = async (req, res) => {
  const imageFile = req.file;
  const user = "cosmos";
  const { postBody } = req.body;
  try {
    if (imageFile || postBody) {
      let cloudUploadResponse = await uploadImage(imageFile.path);
      if (cloudUploadResponse) {
        let postData = await postSchemer(user, postBody, cloudUploadResponse);
        if (postData) {
          res.status(200).send({
            serverResponse: "success, your post has been published!",
            data: postData,
          });
        } else {
          res.status(500).send({ response: "internal error, try again!" });
        }
      }
    }
  } catch (error) {
    res.status(500).send({ response: "internal error" });
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
    const userData = await existUser(username);
    if (userData) {
      res.status(200).send({ userData });
    }
  } catch (error) {
    res.status(401).send({ response: "operation failed" });
  }
};

const signUp = async (req, res) => {
  const { firstName, lastName, username, password, dob } = req.body;
  try {
    let existUsername = await existUser(username);
    if (existUsername) {
      res
        .status(403)
        .send({ response: `username ${username} exist , use a new name` });
    } else {
      const data = await userSchemer(
        firstName,
        lastName,
        username,
        password,
        dob
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
    const userData = await existUser(username);
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
      resstatus(404).send({ response: "user not found" });
    }
  } catch (error) {
    res.status(401).send({ response: "operation failed", error });
  }
};

module.exports = { createPost, getPosts, profile, signIn, signUp };
