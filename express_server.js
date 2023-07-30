const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

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
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!&%*#_?/%$";
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

//Use a cookie session to fetch and encrypt cookies
const key1 = generateRandomString(32);
const key2 = generateRandomString(32);

app.use(
  cookieSession({
    name: "session",
    keys: [key1, key2],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);




//GET routes

//Display the "/urls_index" template containing the list of URLs in our database.
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    //if user is not logged in, redirect to the login page

    return res.send("Please login to access available URLs");
  }

  //Show logged in user's URL. Compare user_id in urldatabase with user_id from cookie

  const urlsForUser = () => {
    const usersURLs = {};
    for (let key in urlDatabase) {
      if (urlDatabase[key].user_id === req.session.user_id) {
        //Store a user's URLs
        usersURLs[key] = urlDatabase[key];
      }
    }
    return usersURLs;
  };

  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(),
  };

  res.render("urls_index", templateVars);
});

//Display the url_new template/page to create new URL
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    // Redirect to login page if user is not logged in
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

//Redirect user to the long URL webpage when a request is made to /u/:id
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; //Fetch the short URL generated
  const longURL = urlDatabase[shortURL].longURL; //Find the corresponding longURL stored in the database

  if (longURL) {
    res.redirect(longURL); //If found, redirect user to the long URL webpage
  } else {
    res.send(
      "Oops! Short url does not exist. Please check the url and try again."
    );
  }
});

//Render the urls_show /edit page to access it via the url_index page
app.get("/urls/:shortId", (req, res) => {
  if (!req.session.user_id) {
    // Redirect to login page if user is not logged in
    return res.send("Please login to access this url!");
  }

  const shortId = req.params.shortId;

  if (urlDatabase[shortId].user_id !== req.session.user_id) {
    return res.send(
      "Url does not exist in your account. Please check and try again!"
    );
  }

  if (!urlDatabase[shortId]) {
    return res.send(
      "Oops! Short url does not exist. Please check the url and try again."
    );
  }

  const templateVars = {
    user: users[req.session.user_id],
    id: shortId,
    longURL: urlDatabase[shortId].longURL,
  };

  res.render("urls_show", templateVars);
});

//Create a GET route to render the reg form
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };

  if (req.session.user_id) {
    //Redirect to /urls if user is already logged in
    return res.redirect("/urls");
  }

  res.render("reg_form", templateVars);
});

//Create a GET route to render the login form
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };

  if (req.session.user_id) {
    // Redirect to /urls if user is already logged in
    return res.redirect("/urls");
  }
  res.render("login_form", templateVars);
});

//POST routes

//Handle POST requests to /urls
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    // If user is not logged in, send an error message and return early
    return res.send("Please login to access this feature.");
  }
  // If user is logged in, proceed with the URL shortening logic
  const newLongURL = req.body.longURL; //Get the longURL inputted in the form
  const newShortURL = generateRandomString(6);

  //Store the new short and long url and associated user_id in the urldatabase
  urlDatabase[newShortURL] = {
    longURL: newLongURL,
    user_id: req.session.user_id,
  };

  res.redirect(`/urls/${newShortURL}`); //Redirect the user to the urls/shortID page
});

//Receives the delete request and deletes a URL resource from the app
app.post("/urls/:id/delete", (req, res) => {
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

  delete urlDatabase[shortURL];

  res.redirect("/urls"); //Redirect to the index page with list of URLs
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

//Add a login POST route to handle user's login
app.post("/login", (req, res) => {
  const userEmailInput = req.body.email;
  const userPasswordInput = req.body.password;

  const userFound = findUser(userEmailInput); //Check if user email exists
  const hashedPassword = userFound.password;

  if (!userFound) {
    return res
      .status(403)
      .send("User account does not exist. Please register for a new account");
  }
  if (userFound && !bcrypt.compareSync(userPasswordInput, hashedPassword)) {
    return res.status(403).send("Incorrect email or password");
  }

  //Set encrypted cookie user_id
  req.session.user_id = userFound.id;
  res.redirect("/urls");
});

//Add a logout POST route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//Create a POST route to handle the registration form data
app.post("/register", (req, res) => {
  const userEmailInput = req.body.email;
  const userPasswordInput = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPasswordInput, 10);
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
    password: hashedPassword,
  };

  //Set encrypted cookie user_id
  req.session.user_id = userRandomID;
  res.redirect("/urls");
});

//Set up the web server to listen on a specific port and displays message once app starts to run
//All other routes should be above the listen method.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
