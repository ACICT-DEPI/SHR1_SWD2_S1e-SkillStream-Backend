const bcrypt = require("bcrypt")
const mongoose = require('mongoose');
const Jwt = require("jsonwebtoken")
require("dotenv").config();



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required : [true, 'name is a required field'],
        maxlength: 32
    },
 
    email: {
        type: String,
        trim: true,
        required : [true, 'email is a required field'],
        unique: true,
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'this email is invalid'
        ]
 
    },
 
    password: {
        type: String,
        trim: true,
        required : [true, 'password is a required field'],
    },
 
    admin: {
        type: Boolean,
        default: false,
    },

 }, {timestamps: true});


userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateJwtToken = function () {
    return Jwt.sign({ _id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: Number.parseInt(process.env.TOKEN_EXPIRES_IN)
    })
}

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }

    // Hash Password
    this.password = await bcrypt.hash(this.password, 13)
})

module.exports = mongoose.model('User', userSchema)