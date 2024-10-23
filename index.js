const express = require('express')
require('dotenv').config();
const connect = require("./dbConnection")
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const errorHandler = require("./middleware/errorHandler");
const { isAuthorized, isAdmin } = require('./middleware/authorization');
const cors = require("cors");
const BlackListedToken = require('./models/BlackListedToken');
const helmet = require("helmet");


// port
const PORT = process.env.PORT || 8000

// cors policy
const corsOptions ={
  // change to your domain
   origin: true, 
   credentials: true,
   optionSuccessStatus: 200,
}

// connect to DB
connect()


// cleanup expired tokens every 1 hour
setInterval(async () => {
  await BlackListedToken.cleanUpExpiredTokens();
}, 60 * 60 * 1000); // 1 hour interval


// Create the express app
const app = express()

// Middleware
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    limit: '100mb',
    extended: true
  }
));


app.use(express.json())  

app.use(helmet())

app.use(cors(corsOptions))
app.use(cookieParser())

// Routes and middleware
app.use("/user/", require("./routes/userRoutes"))
app.use("/users/", isAuthorized, require("./routes/usersRoutes"))
app.use("/profile/", isAuthorized, require("./routes/profileRoutes"))
app.use("/api/course/", require("./routes/courseRoutes"))
app.use("/api/category/", require("./routes/categoryRoutes"))

// Error handlers
app.use(errorHandler)

// Start server
app.listen(PORT, function (err) {
  if (err) {
    return console.error(err)
  }
  console.log(`Started at http://localhost:${PORT}`)
})
