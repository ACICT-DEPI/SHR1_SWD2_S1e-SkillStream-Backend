const expressAsyncHandler = require("express-async-handler");
const User = require("../models/User");
const Joi = require("joi")
const ErrorResponse = require("../utils/errorResponse")
require("dotenv").config()



// Password Validation
const passwordValidationSchema = Joi.object({
    password: Joi
    .string()
    .trim()
    .min(6)
    .pattern(/^(?=.*\d)(?=.*[@#\-_$%^&+=§!\?])(?=.*[a-z])(?=.*[A-Z])[0-9A-Za-z@#\-_$%^&+=§!\?]+$/)
    .required()
})


const signupController = expressAsyncHandler(async (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;

    try {
        // match passwords
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match")
        }
        
        // Validate Password
        const isPasswordInvalid = passwordValidationSchema.validate({ password }).error
        if (isPasswordInvalid) {
            throw new Error(isPasswordInvalid.details[0].message)
        }

        // Check if email already registered
        const userExists = await User.findOne({ email })
        if (userExists) {
            throw new Error("Email already registered")
        }

        // Create User
        const user =await User.create({ name, email, password })

        // generate token
        const token = user.generateJwtToken()
    
        // User created successfully
        res.cookie("token", token, { 
            expires: new Date(Date.now() + Number.parseInt(process.env.TOKEN_EXPIRES_IN)),
            httpOnly: true,
            sameSite: "lax",
            secure: true
        }).json({ success: true, message: "User created successfully" })
        
    } catch (err) {
        // modyfy error message if email already registered
        const error = new ErrorResponse(err.message, 500)

        // Handle Error
        return next(error)
    }
})


const loginController = expressAsyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const wrongCredentialsError = new ErrorResponse(
        "Your login credentials don't match a registered user. Please double-check and try again",
        500
    )

    // check if user exists and password is correct
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) {
        return next(wrongCredentialsError)
    }

    // generate token
    const token = user.generateJwtToken()

    // log in successful
    res.cookie("token", token, {
        expires: new Date(Date.now() + Number.parseInt(process.env.TOKEN_EXPIRES_IN)),
        httpOnly: true,
        sameSite: "lax",
        secure: true
    }).json({ success: true, message: "You're signed in" })
});


module.exports = { signupController, loginController }