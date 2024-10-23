const bcrypt = require("bcrypt")
const mongoose = require('mongoose');
const Jwt = require("jsonwebtoken");
const Joi = require("joi");
const JoiPasswordComplexity = require("joi-password-complexity");
require('dotenv').config();



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required : [true, 'name is a required field'],
        maxlength: 32,
        minlength: 3
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

    avatar: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },

    followers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    },

    following: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    },

    courses: [{
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
            progress: {
                type: Number,
                min: 0,
                max: 100,
                default: 0
            }
        }],

    createdCourses: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Course",
        default: []
    },

    likedCourses: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Course",
        default: []
    }

 }, {timestamps: true});


userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}


userSchema.methods.generateRefreshToken = function () {
    return Jwt.sign({ _id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: Number.parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN)
    })
}


userSchema.methods.generateResetPasswordToken = function () {
    return Jwt.sign({ email: this.email, _id: this._id }, process.env.JWT_SECRET_KEY + this.password, {
        expiresIn: Number.parseInt(process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN)
    })
}

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }

    // Validate Password
    const isPasswordInvalid = Joi.object({
        password: JoiPasswordComplexity().required()
    }).validate({ password: this.password }).error

    if (isPasswordInvalid) {
        throw new Error(isPasswordInvalid.details[0].message)
    }

    // Hash Password
    this.password = await bcrypt.hash(this.password, 13)
})

module.exports = mongoose.model('User', userSchema)