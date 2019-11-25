// reads in our .env file and makes those values available as environment variables
require('dotenv').config();
 
1
const routes = require('./routes/main');
const express = require('express');
const bodyParser = require('body-parser');
 
// create an instance of an express app
const app = express();
 
const PORT = process.env.PORT || 3001;


// update express settings
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
 
// catch all other routes
app.use((req, res, next) => {
  res.status(404);
  res.json({ message: '404 - Not Found' });
});

// main routes
app.use('/', routes);
 
// handle errors
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error : err });
});

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// have the server start listening on the provided port
app.listen(PORT, function() {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});

