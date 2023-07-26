//Set up a basic web server using express.js in node.js
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

//Set ejs template as the view engine
app.set("view engine", "ejs");

//Create a url database, to store and access urls in the app
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//Create a user database, to store and access users in the app
const users = {
  user1RandomID: {
    id: "user1RandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Returns a string of 6 random alphanumeric characters
const generateRandomString = function (length) {
  const alphanumeric =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphanumeric.length); // generates a random index within the range of valid indices for the alphanumeric.
    randomString += alphanumeric[randomIndex];
  }

  return randomString;
};

//Use middleware to make body readable
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Allow for HTTP GET request to the root path "/" of the web app (landing page) and a response from the server
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Set up the web server to listen on a specific port and displays message once app starts to run
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Note: You can start server by running node express_server.js in the terminal.
// Visit http://localhost:8080/ in your browser to see the Hello! response.

//Serve the urlDatabase object as JSON data when the client sends a GET request to the "/urls.json" path
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Include HTMl code in response. Visit http://localhost:8080/hello to see changes
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Create a new route handler for "/urls" and pass the data in urlDatabase variable to our url_index template
app.get("/urls", (req, res) => {
  const objectOfCurrentUserReg = users[req.cookies.user_id];
  const templateVars = {
    user: objectOfCurrentUserReg,
    urls: urlDatabase,
  };

  res.render("urls_index", templateVars);
});

//Create a new route to render the url_new template
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  // Store the shortURL and its corresponding longURL in the database
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`); // redirects the user to the random short URL id generated
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (longURL) {
    res.redirect(longURL); //redirect any request to "/u/:id" to the long URL
  } else {
    res.send("Short URL not found");
  }
});

//Create a new route to render the urls_show template
app.get("/urls/:shortId", (req, res) => {
  //req.params is an object. The : represents req.params key and shortId reps the property
  const shortId = req.params.shortId; //Assign the key-value pair to a variable named shortId
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: shortId,
    longURL: urlDatabase[shortId],
  };
  res.render("urls_show", templateVars);
});

//Edit and update the longURL in the database
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.updatedLongURL;
  urlDatabase[shortURL] = updatedLongURL;

  res.redirect("/urls");
});

//Delete a URL resource from the app
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];

  res.redirect("/urls"); //Redirect to the index page
});

//Add a login POST route to handle user's login
app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.email);
  res.redirect("/urls");
});

//Add a logout POST route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Create a GET route to render the reg form
app.get("/register", (req, res) => {
  res.render("urls_reg");
});

//Create a POST route to handle the registration form data
app.post("/register", (req, res) => {
  const userRandomID = generateRandomString(4);
  users[userRandomID] = {
    id: userRandomID,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie("user_id", userRandomID);
  res.redirect("/urls");
});
