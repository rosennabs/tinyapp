const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const helpers = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

//Create a url database, to store and access urls in the app

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    user_id: "gh364d",
  },
  "9sm5xK": {
    longURL: "https://www.google.ca",
    user_id: "hfuh47",
  },
  w37dh4: {
    longURL: "https://www.github.com",
    user_id: "hfuh47",
  },
};

//Create a user database, to store and access users in the app

const users = {
  gh364d: {
    id: "gh364d",
    email: "user1@gmail.com",
    password: bcrypt.hashSync("dino-saur01", 10)
  },
  hfuh47: {
    id: "hfuh47",
    email: "user2@gmail.com",
    password: bcrypt.hashSync("washer-funk", 10)
  },
};


//Set ejs as the view engine
app.set("view engine", "ejs");

//Use middleware to receive readable info from our forms' body
app.use(express.urlencoded({ extended: true }));

//Use a cookie session to fetch and encrypt cookies
const key1 = helpers.generateRandomString(32);
const key2 = helpers.generateRandomString(32);

app.use(
  cookieSession({
    name: "session",
    keys: [key1, key2],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);



/*

GET routes

*/

//Redirect to /url page if user is not logged in
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

//Render the "/urls_index" template 
app.get("/urls", (req, res) => {
  if (!req.session.user_id) { //if user is not logged in, redirect to the login page
    return res.send("Please login to access available URLs");
  }

  //Pass variables in a json object for use in the front end
  const templateVars = {
    user: users[req.session.user_id],
    urls: helpers.urlsForUser(req.session.user_id, users, urlDatabase)
  };

  res.render("urls_index", templateVars);
});

//Display the url_new template/page to create new URL
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) { // Redirect to login page if user is not logged in
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

//Redirect user to the long URL webpage when a request is made to /u/:id
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    return res.send(
      "Oops! Short url does not exist. Please check the url and try again."
    );
  }
  const longURL = urlDatabase[shortURL].longURL; //Find the corresponding longURL stored in the database

  res.redirect(longURL);
});

//Render the urls_show /edit page
app.get("/urls/:shortId", (req, res) => {
  if (!req.session.user_id) { // Redirect to login page if user is not logged in.
    return res.send("Please login to access this url.");
  }

  const shortId = req.params.shortId;

  if (!urlDatabase[shortId]) {
    return res.send(
      "Oops! Short url does not exist. Please check the url and try again."
    );
  }

  if (urlDatabase[shortId].user_id !== req.session.user_id) {
    return res.send(
      "Url does not exist in your account. Please check and try again!"
    );
  }

  const templateVars = {
    user: users[req.session.user_id],
    id: shortId,
    longURL: urlDatabase[shortId].longURL
  };

  res.render("urls_show", templateVars);
});

//Render the reg form
app.get("/register", (req, res) => {
 
  if (req.session.user_id) { //Redirect to /urls if user is already logged in
    return res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.session.user_id]
  };

  res.render("reg_form", templateVars);
});

//Render the login form
app.get("/login", (req, res) => {
 
  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login_form", templateVars);
});


/*

POST routes

*/

//Handle POST requests to /urls and create new urls
app.post("/urls", (req, res) => {
  if (!req.session.user_id) { // If user is not logged in, send an error message and return early
    return res.send("Please login to access this feature.");
  }
  // If user is logged in, proceed with the URL shortening logic
  const newLongURL = req.body.longURL; //Fetch the longURL inputted through the form
  const newShortURL = helpers.generateRandomString(6);

  //Store the new short and long url and associated user_id in the urldatabase
  urlDatabase[newShortURL] = {
    longURL: newLongURL,
    user_id: req.session.user_id
  };

  res.redirect(`/urls/${newShortURL}`); 
});

//Receive the delete request and deletes a URL resource from the database
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    return res.send("Oops! Short url does not exist. Please check the url and try again.");
  }

  if (!req.session.user_id) {
    return res.send("Please login to access this feature.");
  }

  if (urlDatabase[shortURL].user_id !== req.session.user_id) {
    return res.send("Unauthorized access. You can only edit your own URLs.");
  }

  delete urlDatabase[shortURL];

  res.redirect("/urls");
});

//Edit and update the longURL in the database
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    return res.send(
      "Oops! Short url does not exist. Please check the url and try again."
    );
  }

  if (!req.session.user_id) {
    return res.send("Please login to access this feature.");
  }

  if (urlDatabase[shortURL].user_id !== req.session.user_id) {
    return res.send("Unauthorized access. You can only edit your own URLs.");
  }

  const updatedLongURL = req.body.updatedLongURL;
  urlDatabase[shortURL].longURL = updatedLongURL;

  res.redirect("/urls");
});


//Create a POST route to handle the registration form data
app.post("/register", (req, res) => {
  const userEmailInput = req.body.email;
  const userPasswordInput = req.body.password;
  
  if (!userEmailInput || !userPasswordInput) {
    return res.status(400).send("Please enter an email and password");
  }

  const userFound = helpers.getUserByEmail(userEmailInput, users); //Check if user email exists
  if (userFound) {
    return res.status(400).send("Email already exists");
  }

  const hashedPassword = bcrypt.hashSync(userPasswordInput, 10); //Hash user's password for security
  const userRandomID = helpers.generateRandomString(6);

  //Store new user in the users database
  users[userRandomID] = {
    id: userRandomID,
    email: userEmailInput,
    password: hashedPassword,
  };

  //Set encrypted cookie user_id
  req.session.user_id = userRandomID;
  res.redirect("/urls");
});


//Add a login POST route to handle user's login
app.post("/login", (req, res) => {
  const userEmailInput = req.body.email;
  const userPasswordInput = req.body.password;

  const userFound = helpers.getUserByEmail(userEmailInput, users); //Check if user email exists

  if (!userFound) {
    return res.status(403).send("User account does not exist. Please register for a new account");
  }

  const hashedPassword = userFound.password;

  if (!bcrypt.compareSync(userPasswordInput, hashedPassword)) {
    return res.status(403).send("Incorrect email or password");
  }

  req.session.user_id = userFound.id; //Set encrypted cookie user_id
  res.redirect("/urls");
});

//Add a logout POST route
app.post("/logout", (req, res) => {
  req.session = null; //Delete cookies
  res.redirect("/login");
});


//Set up the web server to listen on a specific port and displays message once app starts to run
//Ensure all other routes are above the listen method.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
