const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT;
const app = express();
const bodyParser = require("body-parser");
const { createPost } = require("./Routes/Api");
const { uploadImage } = require("./Middleware/upload");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.post("/api/create", uploadImage(), createPost);

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
