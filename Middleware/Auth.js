const jwt = require("jsonwebtoken");
function Auth(req, res, next) {
  let userToken = req.cookies.userToken;
  if (!userToken) {
    res.redirect("/", 302);
  }
  let data = jwt.verify(userToken, process.env.api_secret);
  req.user = data;
  next();
}

module.exports = { Auth };
