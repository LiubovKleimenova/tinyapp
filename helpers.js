const checkUser = function(email, db) {
  for (let user in db) {
    if (email === db[user].email) {
      console.log(`db user ${db[user].email}`);
      return db[user];
    }
  }
  return null;
};


function generateRandomString() {
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomChar = "";
  for (let i = 1; i <= 6; i++) {
    randomChar += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return randomChar;
}

module.exports = {checkUser, generateRandomString}