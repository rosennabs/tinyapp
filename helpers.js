//Find user in the user database using their email address
const getUserByEmail = function (email, users) {
  for (let key in users) {
    const user = users[key];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

module.exports = { getUserByEmail };