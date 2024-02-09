const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
dotenv.config();
const port = process.env.PORT;
const app = express();
const bodyParser = require("body-parser");
const {
  createPost,
  getPosts,
  signUp,
  signIn,
  profile,
  thumbsUp,
  thumbsDown,
} = require("./Routes/Api");
const { uploadImage } = require("./Middleware/upload");
const { Auth } = require("./Middleware/Auth");
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

app.post("/api/create", Auth, uploadImage(), createPost);
app.get("/api/posts", getPosts);
app.post("/api/sign-up", signUp);
app.post("/api/sign-in", signIn);

app.get("/api/profile", Auth, profile);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.post("/api/like-post", thumbsUp);
app.post("/api/thumbsdown", thumbsDown);

app.get("/post/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.get("/create", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.post("/api/log-out", (req, res) => {
  res.clearCookie("userToken");
  res.cookie("userToken", "", { maxAge: 0, path: "/api/" });
  res.send({ response: "account signed out" });
});
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
