//Set up a basic web server using express.js in node.js
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//Set ejs template as the view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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


//Create a new route handler for "/urls" and pass the data in urlDatabase variable to our template
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Create a new route to render the url_new template
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortId", (req, res) => {//req.params is an object. The : represents req.params key and shortId reps the property
  const shortId = req.params.shortId; //Assign the key-value pair to a variable named shortId
  const templateVars = {
    id: shortId,
    longURL: urlDatabase[shortId]
  };
  res.render("urls_show", templateVars);
});


