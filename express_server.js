//Set up a basic web server using express.js in node.js
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Allow for HTTP GET request to the root path "/" of the web app and a response from the server
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Set up the web server to listen on a specific port abnd displays message once app starts to run
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Note: You can start server by running node express_server.js in the terminal.
// Visit http://localhost:8080/ in your browser to see the Hello! response.

