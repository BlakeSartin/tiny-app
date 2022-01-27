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
const urlsForUser = function(id, data){
  let userUrls = {};

  for (const shortURL in data) {
    if (data[shortURL].userID === id) {
      userUrls[shortURL] = data[shortURL];
    }
  }

  return userUrls;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
},
i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
}
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
const getUserByEmail = (email, data) => {
  for (const user in data) {
    if (data[user].email === email) {
      return data[user];
    }
  }
  return undefined;
};



app.get("/urls/new", (req, res) => {
  const registerID = req.cookies["user_id"];
  const user = users[registerID];
  if(!user){
    res.redirect('/login')
  } else {
  res.render("urls_new", {user: user});
  //Brings us to urls_new
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const registerID = req.cookies["user_id"];
  const user = users[registerID];
  const templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
  // Brings us to show page
});

app.get("/", (req, res) => {
  if (req.cookies["userID"]) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
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
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]}
  console.log('urldatabase',urlDatabase); // Log the POST request body to the console
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
  if(req.cookies["userID"]) {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  } else {
    res.status(401)
    res.send("Please login to delete!")
  }
  console.log("cookie", req.cookies["userID"])
  //Deletes short url and take you back to main url page
});
app.get("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
  // Takes you to new short url description page
});
app.post("/urls/:shortURL", (req, res) => {
  if(req.cookies["userID"]) {
  const shortURL = req.params.shortURL;
  const updatedURL = {longURL: req.body.updatedURL, userID: req.cookies["user_id"]}
  urlDatabase[shortURL] = updatedURL;
  res.redirect(`/urls`);
  } else {
    res.status(401)
    res.send("Please login to edit!")
  }
  // Page for editing short urls then submitting them. Redirects to main url page
});
app.get("/urls", (req, res) => {
  const registerID = req.cookies["user_id"];
  const user = users[registerID]['id'];
  console.log(user)
  const userUrls = urlsForUser(user, urlDatabase);
  const templateVars = {
    user: user,
    urls: userUrls,
  };
  res.render("urls_index", templateVars);
  //Brings us to index
});
app.get("/login", (req, res) => {
  const registerID = req.cookies["user_id"];
  const user = users[registerID];
  const templateVars = {
    user: user,
    urls: urlDatabase,
  };
  res.render('login', templateVars);
})

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users)
  console.log('user', user)
  res.cookie("user_id", user.id)
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
 res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/registration", (req, res) => {
  res.render("registration", {user: null});
});

app.post("/registration", (req, res) => {
  const registerID = generateRandomString();
  const registerEmail = req.body.email;
  const registerPassword = req.body.password;

  if (registerEmail === "" || registerPassword === "") {
    return res.status(400).send("email or password cannot be empty");
  }
  if (getUserByEmail(registerEmail, users)) {
    return res.status(400).send("email already exists");
  }

  users[registerID] = {
    id: registerID,
    email: registerEmail,
    password: registerPassword,
  };
  res.cookie("user_id", registerID);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
