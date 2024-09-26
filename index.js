const express = require('express')
require('dotenv').config();
const connect = require("./dbConnection")
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const errorHandler = require("./middleware/errorHandler");
const { isAuthorized, isAdmin } = require('./controllers/userAuthorization');
const cors = require("cors");


// port
const PORT = process.env.PORT || 8000

// cors options
const corsOptions ={
  // change to your domain
   origin: true, 
   credentials: true,
   optionSuccessStatus: 200,
}

// connect to DB
connect()


// Create the express app
const app = express()

// Middleware
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    limit: '100mb',
    extended: true
    }));

app.use(cors(corsOptions))
app.use(cookieParser())

// Routes and middleware
app.use("/user/", require("./routes/userRoutes"))

app.use("/hello", isAuthorized, isAdmin, (req, res) => {
    res.json("Hello World")
})
// Error handlers
app.use(errorHandler)

// Start server
app.listen(PORT, function (err) {
  if (err) {
    return console.error(err)
  }
  console.log(`Started at http://localhost:${PORT}`)
})
