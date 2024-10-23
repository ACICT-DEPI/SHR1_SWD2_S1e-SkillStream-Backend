const expressAsyncHandler = require("express-async-handler");
const User = require("../models/User");
const Jwt = require("jsonwebtoken")
const ErrorResponse = require("../utils/errorResponse")
const nodeMailer = require("nodemailer");
const BlackListedToken = require("../models/BlackListedToken");
require("dotenv").config()



const signupController = expressAsyncHandler(async (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;

    try {
        // match passwords
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match")
        }

        // Check if email already registered
        const userExists = await User.findOne({ email })
        if (userExists) {
            throw new Error("Email already registered")
        }

        // Create User
        const user = await User.create({ name, email, password })

        // generate refresh_token
        const refresh_token = user.generateRefreshToken()
    
        // User created successfully
        res.cookie("refresh_token", refresh_token, {
        expires: new Date(Date.now() + Number.parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) * 1000),
            httpOnly: true,
            sameSite: false,
            secure: true
        }).json({ success: true, message: "User created successfully", user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            following: user.following,
            followers: user.followers,
            courses: user.courses,
            createdCoureses: user.createdCourses,
            likedCourses: user.likedCourses,
            avatar: user.avatar,
            createdAt: user.createdAt
        } })
        
    } catch (err) {
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
    .populate("following", "name avatar courses followers")
    .populate("followers", "name avatar courses followers")
    .populate({ path: "likedCourses", populate: [{ path: "instructors", select: "name avatar courses followers" }, { path: "categories", select: "name _id" }] })
    .populate({ path: "createdCourses", populate: [{ path: "instructors", select: "name avatar courses followers" }, { path: "categories", select: "name _id" }] })
    .populate({ path: "courses", populate: { path: "course", populate: [{ path: "instructors", select: "name avatar courses followers" }, { path: "categories", select: "name _id" }] } })

    if (!user || !(await user.matchPassword(password))) {
        return next(wrongCredentialsError)
    }

    // generate refresh_token
    const refresh_token = user.generateRefreshToken()

    // log in successful
    // should I use getProfile instead ?
    res.cookie("refresh_token", refresh_token, {
        expires: new Date(Date.now() + Number.parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) * 1000),
        httpOnly: true,
        sameSite: false,
        secure: true
    }).json({ success: true, message: "You're signed in", user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        following: user.following,
        followers: user.followers,
        courses: user.courses,
        createdCoureses: user.createdCourses,
        likedCourses: user.likedCourses,
        avatar: user.avatar,
        createdAt: user.createdAt
    } })
});


const logoutController = expressAsyncHandler(async (req, res, next) => {
    const { refresh_token } = req.cookies
    try {
        if (!refresh_token) {
            throw new ErrorResponse("You're not signed in", 401)
        }

        // should I check if refresh_token is blacklisted ?

        const expiresAt = Jwt.decode(refresh_token).exp
        await BlackListedToken.create({ token: refresh_token, expiresAt: new Date(expiresAt * 1000) })
        await BlackListedToken.cleanUpExpiredTokens()
    } catch (error) {
        return next(error)
    }
    res.set('Authorization', ``);
    res.clearCookie("refresh_token").json({ success: true, message: "You've been signed out" })
})


const forgotPasswordController = expressAsyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorResponse("Please provide an email", 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorResponse("There is no user with that email", 404));
    }

    const resetUrl = `https://backend-eta-ten-70.vercel.app/account/reset-password/${user._id}/${user.generateResetPasswordToken()}`;

    // send email
    try {
        nodeMailer
            .createTransport({
                service: "gmail",
                auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                },
            })
            .sendMail({
                from: process.env.MAIL_USERNAME,
                to: user.email,
                subject: "Reset Password",
                html: `<div style="
                            height: fit-content;
                            width: fit-content;
                            padding: 1vh 5vw;
                            background: #f2f2f2;
                        ">
                            <div style="
                                    margin: 5vh;
                                    height: fit-content;
                                    padding: 5vh;
                                    background-image: linear-gradient(#bfbfbf, #d9d9d9);
                                    font-size: 3.5vh;
                                    text-align: center;
                                    ">

                                <div style="
                                        width: fit-content;
                                        background: teal; 
                                        font-size: 8vh;
                                        color: white;
                                        padding: 2vh; 
                                        border-radius: 10px;
                                        margin:auto;
                                    ">
                                        SkillStream
                                </div>

                                <h1>Password reset request</h1>

                                <p style="margin-bottom: 15vh;">
                                    We've received a password reset request for your SkillStream account.
                                    This link will expire in 10 minutes. If you did not request a password change,
                                    please ignore this email, no changes will be made to your account.
                                    Another user may have entered your email by mistake.
                                </p>

                                <div> Please click the link below to reset your password. </div>
                                
                                <a style="
                                        display: block;
                                        margin: auto;
                                        width: fit-content;
                                        text-decoration: none;
                                        padding: 7vh;
                                        border-radius: 100vh;
                                        color:white;
                                        background: teal;
                                        margin-top: 5vh
                                    "
                                    href="${resetUrl}">
                                        Reset Password
                                </a>
                            </div>
                        </div>`,
            })
    } catch (error) {
        next(new ErrorResponse(error.message, 500));
    }

    res.json({ success: true, message: "Email sent. Check your inbox" });

});


const resetPasswordController = expressAsyncHandler(async (req, res, next) => {
    const { resetPasswordToken, id } = req.params;
    const { password, confirmPassword } = req.body;
    try {
        
        const user = await User.findById(id)
        if (!user) {
            throw new ErrorResponse("User not found", 404);
        }

        // check if token is valid
        const isValid = Jwt.verify(resetPasswordToken, process.env.JWT_SECRET_KEY + user.password);
        if (!isValid) {
            throw new ErrorResponse("Invalid token", 400);
        }
    
        // check if passwords match
        if (password !== confirmPassword) {
            throw new ErrorResponse("Passwords do not match", 400)
        }

        // TODO: check if new password is the same as the old one
    
        // update password
        user.password = password;
        await user.save();
        
    } catch (error) {
        return next(new ErrorResponse("Something went wrong", error.statusCode));
    }

    res.json({ success: true, message: "Password reset successfully. You can now login" });

});

// TODO: Add verify email functionality

module.exports = { signupController, loginController, forgotPasswordController, resetPasswordController, logoutController };