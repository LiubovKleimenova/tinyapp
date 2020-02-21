// returns users from the database
//  according to users email
const getUserByEmail = function(email, db) {
  for (let user in db) {
    if (email === db[user].email) {
      //console.log(`db user ${db[user].email}`);
      return db[user];
    }
  }
  return false;
};

//generates random String of 6 chars
function generateRandomString() {
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomChar = "";
  for (let i = 1; i <= 6; i++) {
    randomChar += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return randomChar;
}

module.exports = { getUserByEmail, generateRandomString };