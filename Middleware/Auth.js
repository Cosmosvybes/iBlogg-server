const jwt = require("jsonwebtoken");
function Auth(req, res, next) {
  let userToken = req.cookies.userToken;
  if (!userToken) {
    res.status(401).send({ response: "page protected, sign in." });
  }
  let data = jwt.verify(userToken, process.env.api_secret);
  req.user = data;
  next();
}

module.exports = { Auth };
