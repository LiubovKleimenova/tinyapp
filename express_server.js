const express = require("express");
const morgan = require("morgan")
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(morgan("dev"));

function generateRandomString() {
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomChar = "";
  for (let i = 1; i <= 6; i++) {
    randomChar += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return randomChar;
}

const checkEmail = function (email) {
  for (let user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
}

const checkUser = function (email, password) {
  for (let user in users) {
    if (email === users[user].email && password === users[user].password) {
      return users[user];
    }
  }
}

const urlsForUser = function (id) {
  let usersUrlDatabase = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      usersUrlDatabase[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  console.log(usersUrlDatabase)
  return usersUrlDatabase;
}

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "QyJaVT"
  },
  i3BoGr: { longURL: "https://www.google.ca", userID: "QyJaVT" }
};

const users = {}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL,
  userID: req.cookies.user_id};
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  //console.log(req.cookies["user_id"]);
  //console.log(urlDatabase);
  //console.log(urlsForUser(req.cookies["user_id"]));
  if (req.cookies.user_id) {
    let templateVars = {
      urls: urlsForUser(req.cookies["user_id"]),
      user: users[req.cookies["user_id"]]
    };
    
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login")
  }
  
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    let templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let longUrl = urlDatabase[req.params.shortURL];
  res.redirect(longUrl);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let templateVars = {email: req.body.email, password: req.body.password, user: users[req.cookies.user_id]};
  res.render("urls_login", templateVars);
  console.log(users)
});

app.post("/login", (req, res) => {
  let user = checkUser(req.body.email, req.body.password);
  if (user) {
      res.cookie("user_id", user.id);
      res.redirect("/urls")
    } else {
      res.sendStatus(403);
    }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get('/register', (req, res) => {
  let templateVars = {email: req.body.email, password: req.body.password, user: users[req.cookies.user_id]};
  res.render("urls_registration", templateVars);
  
})

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  }
  if (checkEmail(req.body.email)) {
    res.sendStatus(400);
  } else {
  let id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", id);
  res.redirect("/urls")}
});

