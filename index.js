const express = require('express')
require('dotenv').config();
const connect = require("./dbConnection")
const bodyParser = require('body-parser');

// port
const PORT = process.env.PORT || 8000

// connect to DB
connect()



// Create the express app
const app = express()

app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    limit: '100mb',
    extended: true
    }));
// Routes and middleware
// Error handlers


// Start server
app.listen(PORT, function (err) {
  if (err) {
    return console.error(err)
  }
  console.log(`Started at http://localhost:${PORT}`)
})
