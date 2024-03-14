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
const passwordToken = (req, res, next) => {
  const userToken = req.cookies.passToken;
  if (!userToken) {
    res.send({ response: "not authorized" });
  }
  const dataToken = jwt.verify(userToken, process.env.api_secret);
  req.user = dataToken;
  next();
};

module.exports = { Auth, passwordToken };
