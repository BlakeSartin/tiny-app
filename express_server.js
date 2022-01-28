const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const express = require("express");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1"],
  })
);
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helper");

const urlDatabase = {};
const users = {};

app.get("/urls/new", (req, res) => {
  const registerID = req.session["user_id"];
  const user = users[registerID];
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", { user: user });
    //Brings us to urls_new
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const registerID = req.session["user_id"];
  const user = users[registerID];
  const data = urlDatabase[req.params.shortURL];
  if (!data) {
    return res.status(400).send("HTML does not exist");
  }
  if (!registerID) {
    return res.status(400).send("Pleas login to see urls!");
  }

  const templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: data.longURL,
  };
  if (user.id !== data.userID) {
    return res.status(400).send("You do not own this url!");
  }
  res.render("urls_show", templateVars);
  // Brings us to show page
});

app.get("/", (req, res) => {
  if (req.session["userID"]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
  // Home Page
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  res.end();
  //Test
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
  // Test
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const dateMade = new Date();
    const parsedDateMade = moment(dateMade).format("MMMM Do YYYY, h:mm:ss a");
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    date: parsedDateMade
  };
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
  // Makes change on index page. Generates random sting then assigns it to short url.
  // Brings you to short url change description page
});
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const data = urlDatabase[req.params.shortURL];
  if (!data) {
    return res.status(400).send("HTML does not exist");
  }
  const longURL = data.longURL;

  res.redirect(longURL);
  // Page for new short url
});
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(401);
    res.send("Please login to delete!");
  }
  //Deletes short url and take you back to main url page
});
app.get("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
  // Takes you to new short url description page
});
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    const dateMade = new Date();
    const parsedDateMade = moment(dateMade).format("MMMM Do YYYY, h:mm:ss a");
    const updatedURL = {
      longURL: req.body.updatedURL,
      userID: req.session.user_id,
      date: parsedDateMade,
    };
    urlDatabase[shortURL] = updatedURL;
    res.redirect(`/urls`);
  } else {
    res.status(401);
    res.send("Please login to edit!");
  }
  // Page for editing short urls then submitting them. Redirects to main url page
});
app.get("/urls", (req, res) => {
  const registerID = req.session.user_id;
  if (!registerID) {
    return res.status(400).send("Please login to see your urls!");
  }
  const user = users[registerID];
  const userUrls = urlsForUser(user.id, urlDatabase);
  const templateVars = {
    user: user,
    urls: userUrls,
  };

  res.render("urls_index", templateVars);
  //Brings us to index
});
app.get("/login", (req, res) => {
  const registerID = req.session.user_id;
  const user = users[registerID];
  const templateVars = {
    user: user,
    urls: urlDatabase,
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  const registerPassword = req.body.password;
  if (registerPassword === "") {
    res.redirect("/");
  }
  if (user === undefined) {
    res.redirect("/");
  }
  if (bcrypt.compareSync(registerPassword, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
  res.redirect("/");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/registration", (req, res) => {
  res.render("registration", { user: null });
});

app.post("/registration", (req, res) => {
  const registerID = generateRandomString();
  const registerEmail = req.body.email;
  const registerPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(registerPassword, 10);

  if (registerEmail === "" || registerPassword === "") {
    return res.status(400).send("email or password cannot be empty");
  }
  if (getUserByEmail(registerEmail, users)) {
    return res.status(400).send("email already exists");
  }

  users[registerID] = {
    id: registerID,
    email: registerEmail,
    password: hashedPassword,
  };
  req.session.user_id = registerID;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
