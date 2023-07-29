//Set up a basic web server using express.js in node.js
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080; // default port 8080

//Create a url database, to store and access urls in the app
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//Create a user database, to store and access users in the app
const users = {
  gh364d: {
    id: "gh364d",
    email: "user1@gmail.com",
    password: "dino-saur01",
  },
  hfuh47: {
    id: "hfuh47",
    email: "user2@gmail.com",
    password: "washer-funk",
  },
};

//Create a string of 6 random alphanumeric characters
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

//Check if email input already exists in the user database
const findUser = function (email) {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return null;
};

//Set ejs as the view engine
app.set("view engine", "ejs");

//Use middleware to receive readable info from our forms' body
app.use(express.urlencoded({ extended: true }));

//Use a cookie parser to fetch cookies
app.use(cookieParser());




//GET routes 

//Display the "/urls_index" template containing the list of URLs in our database.
app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) { //if user is not logged in, redirect to the login page
    
    return res.redirect("/login");
  }

  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase,
  };

  res.render("urls_index", templateVars);
});

//Display the url_new template/page to create new URL
app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    // Redirect to login page if user is not logged in
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});

//Redirect user to the long URL webpage when a request is made to /u/:id
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; //Fetch the short URL generated
  const longURL = urlDatabase[shortURL]; //Find the corresponding longURL stored in the database

  if (longURL) {
    res.redirect(longURL); //If found, redirect user to the long URL webpage
  } else {
    res.send("URL does not exist in our database");
  }
});

//Render the urls_show /edit page to access it via the url_index page
app.get("/urls/:shortId", (req, res) => {
  const shortId = req.params.shortId; 

  if (!urlDatabase[shortId]) {
    return res.send("Short URL not available");
  }

  const templateVars = {
    user: users[req.cookies.user_id],
    id: shortId,
    longURL: urlDatabase[shortId],

  };

  res.render("urls_show", templateVars);
});

//Create a GET route to render the reg form
app.get("/register", (req, res) => {

  const templateVars = {
    user: users[req.cookies.user_id]
  };

  if (req.cookies.user_id) {
    //Redirect to /urls if user is already logged in
    return res.redirect("/urls");
  }
  
  res.render("reg_form", templateVars);
});

//Create a GET route to render the login form
app.get("/login", (req, res) => {

  const templateVars = {
    user: users[req.cookies.user_id]
  };

  if (req.cookies.user_id) {

    // Redirect to /urls if user is already logged in
    return res.redirect("/urls");
  }
  res.render("login_form", templateVars);
});






//POST routes

//Recieve the form submission done in the urls_new page
app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    // If user is not logged in, send an error message and return early
    return res.send("Only registered users can access this feature.");
  }
  // If user is logged in, proceed with the URL shortening logic
  const longURL = req.body.longURL; //Get the longURL inputted in the form
  const shortURL = generateRandomString(6); 

  urlDatabase[shortURL] = longURL; //Store the shortURL and its corresponding longURL in the urldatabase


  res.redirect(`/urls/${shortURL}`); //Redirect the user to the urls/shortID page
});

//Receives the delete request and deletes a URL resource from the app
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];

  res.redirect("/urls"); //Redirect to the index page with list of URLs
});


//Edit and update the longURL in the database
app.post("/urls/edit/:id", (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.updatedLongURL;
  urlDatabase[shortURL] = updatedLongURL;

  res.redirect("/urls");
});

//Add a login POST route to handle user's login
app.post("/login", (req, res) => {
  const userEmailInput = req.body.email;
  const userPasswordInput = req.body.password;

  const userFound = findUser(userEmailInput); //Check if user email exists
  if (!userFound) {
    return res.status(403).send("User account does not exist. Please register for a new account");
  }
  if (userFound && userPasswordInput !== userFound.password) {
    return res.status(403).send("Incorrect email or password");
  }

  res.cookie("user_id", userFound.id);
  res.redirect("/urls");

});

//Add a logout POST route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//Create a POST route to handle the registration form data
app.post("/register", (req, res) => {
  const userEmailInput = req.body.email;
  const userPasswordInput = req.body.password;
  const userRandomID = generateRandomString(6);

  if (!userEmailInput || !userPasswordInput) {
    return res.status(400).send("Please enter your email and password");
  }
  const userFound = findUser(userEmailInput); //Check if user email exists
  if (userFound) {
    return res.status(400).send("Email already exists");
  }

  //Store new user in the users database
  users[userRandomID] = {
    id: userRandomID,
    email: userEmailInput,
    password: userPasswordInput,
  };

  res.cookie("user_id", userRandomID);
  res.redirect("/urls");
});



//Set up the web server to listen on a specific port and displays message once app starts to run
//All other routes should be above the listen method.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});