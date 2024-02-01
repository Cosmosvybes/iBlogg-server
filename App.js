const express = require("express");
const port = process.env.PORT || 1818;
const app = express();
const bodyParser = require("body-parser");
const { createPost } = require("./Routes/Api");
app.use(bodyParser.urlencoded({ extended: false }));
const multer = require("multer");
const upload = multer({ dest: "images/" });
app.use(express.json());

app.post("/api/create", upload.single("image"), createPost);

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
