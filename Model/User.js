const { bloggers } = require("../Utils/mongodb");
const bcrypt = require("bcrypt");

const userSchemer = async (firstName, lastName, username, password, dob) => {
  try {
    let saltRound = 10;
    let encryptedPassword = await bcrypt.hash(password, saltRound);
    const newUser = await bloggers.insertOne({
      name: firstName,
      lastName: lastName,
      bio: "",
      dob: dob,
      username: username,
      password: encryptedPassword,
      posts: [],
    });
    if (newUser.insertedId) {
      return { newUser: await existUser(username) };
    }
  } catch (error) {
    return { error };
  }
};

const getUser = async (username) => {
  const userData = await bloggers.findOne({ username: username });
  return userData;
};

module.exports = { userSchemer, getUser };
