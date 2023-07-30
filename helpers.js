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


//Create a string of 6 random alphanumeric characters
const generateRandomString = function (length) {
  const alphanumeric =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!&%*#_?/%$";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphanumeric.length); // generates a random index within the range of valid indices for the alphanumeric.
    randomString += alphanumeric[randomIndex];
  }

  return randomString;
};



module.exports = {
  getUserByEmail,
  generateRandomString
};