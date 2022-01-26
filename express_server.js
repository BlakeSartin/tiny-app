const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  //Brings us to urls_new
});


app.get("/urls/:shortURL", (req, res) => {
  const registerID = req.cookies["user_id"]
  const user = users[registerID]
  const templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
  // Brings us to show page
});

app.get("/", (req, res) => {
  res.send("Hello!");
  res.end();
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
  urlDatabase[shortURL] = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
  // Makes change on index page. Generates random sting then assigns it to short url.
  // Brings you to short url change description page
});
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  // Page for new short url
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  //Deletes short url and take you back to main url page
});
app.get("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
  // Takes you to new short url description page
});
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const updatedURL = req.body.updatedURL;
  urlDatabase[shortURL] = updatedURL;
  res.redirect(`/urls`);
  // Page for editing short urls then submitting them. Redirects to main url page
});
app.get("/urls", (req, res) => {
  const registerID = req.cookies["user_id"]
  const user = users[registerID]
  const templateVars = {
    user: user,
    urls: urlDatabase,
  };
  console.log("registerId",templateVars)
  res.render("urls_index", templateVars);
  //Brings us to index
});
app.post("/login", (req, res) => {
  
  const username = req.body.username;
  console.log(username);
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/registration", (req, res) => {
  res.render("registration");
});

app.post("/registration", (req, res) => {
  const registerID = generateRandomString()
  const registerEmail = req.body.email
  const registerPassword = req.body.password

  users[registerID] = {
    'id': registerID,
    'email': registerEmail,
    'password': registerPassword
  }
  res.cookie("user_id", registerID)
  res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
