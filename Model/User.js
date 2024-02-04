const { bloggers, bloggs } = require("../Utils/mongodb");
const userSchemer = async (firstName, lastName, username, password, dob) => {
  try {
    const newUser = await bloggers.insertOne({
      name: firstName,
      lastName: lastName,
      bio: "",
      dob: dob,
      username: username,
      password: password,
      post: [],
    });
    if (newUser.insertedId) {
      return { newUser };
    }
  } catch (error) {
    return { error };
  }
};



module.exports = { userSchemer };
