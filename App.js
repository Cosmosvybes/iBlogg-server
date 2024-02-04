const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
const port = process.env.PORT;
const app = express();
const bodyParser = require("body-parser");
const { createPost, getPosts } = require("./Routes/Api");
const { uploadImage } = require("./Middleware/upload");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

app.post("/api/create", uploadImage(), createPost);
app.get("/api/posts", getPosts);
app.get("/", (req, res) => {
  res.sendFile(__dirname, "dist", "index.html");
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
