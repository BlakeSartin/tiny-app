function generateRandomString() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const urlsForUser = function (id, data) {
  let userUrls = {};

  for (const shortURL in data) {
    if (data[shortURL].userID === id) {
      userUrls[shortURL] = data[shortURL];
    }
  }

  return userUrls;
};

const getUserByEmail = (email, data) => {
  for (const user in data) {
    if (data[user].email === email) {
      return data[user];
    }
  }
  return undefined;
};

module.exports = {getUserByEmail, generateRandomString, urlsForUser};
