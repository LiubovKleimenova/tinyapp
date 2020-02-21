const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString } = require("./helpers.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "user_id",
    keys: ["qwerty"]
  })
);
app.set("view engine", "ejs");
app.use(morgan("dev"));

// databases for app data
const urlDatabase = {};
const users = {};

//creates database of URLS for user with id
const urlsForUser = function(id) {
  let usersUrlDatabase = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      usersUrlDatabase[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return usersUrlDatabase;
};

// SERVER RESPONCE
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// ------ROUTES ---------
//redirects to index/login for auth/not auth users
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login")
  }
});

// data for index page
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect("/urls");
});

// renders index page if user is logged in
// otherwise redirects to login page
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      urls: urlsForUser(req.session.user_id),
      user: users[req.session["user_id"]]
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});


// urls/new
// renders new page with the form for adding new url
// if user is logged in. otherswise redirects to login page
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = { user: users[req.session["user_id"]] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
      let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL]["longURL"],
        user: users[req.session["user_id"]]
      };
      res.render("urls_show", templateVars);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(404);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(`https://www.${urlDatabase[req.params.shortURL].longURL}`);
});

//login form
app.get("/login", (req, res) => {
  let templateVars = {
    email: req.body.email,
    password: req.body.password,
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
  //console.log(users);
});

app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email, users);
  if (!user) {
    res.status(403).send("User does not exist");
  } else {
    console.log(user);
    console.log(user.id);
    console.log(req.body.password)
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Email or password is incorrect");
    }
  }
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  console.log(users);
  res.redirect("/urls");
});

//registration form
app.get("/register", (req, res) => {
  let templateVars = {
    email: req.body.email,
    password: req.body.password,
    user: users[req.session.user_id]
  };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Password and email are required");
  }
  if (getUserByEmail(req.body.email, users)) {
    res.status(400).send("This user exists");
  } else {
    let id = generateRandomString();
    users[id] = {
      id: id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = id;
    res.redirect("/urls");
  }
  console.log(users);
});
