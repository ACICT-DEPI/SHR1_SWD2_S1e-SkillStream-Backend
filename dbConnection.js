const mongoose = require('mongoose');

require('dotenv').config();

// CONNECT TO DATABASE
const connect = () => {
    mongoose.connect(process.env.DATABASE)
    .then(()=> console.log('Connected to database'))
    .catch((err)=> console.log(err));
}

module.exports = connect 