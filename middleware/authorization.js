const Jwt = require("jsonwebtoken")
const ErrorResponse = require("../utils/errorResponse")
const User = require("../models/User")


const isAuthorized = async (req, res, next) => {

    const token = req.cookies.token

    // check if token exists
    // if (!token) {
    //     return next(new ErrorResponse("You must be logged in to access this ressource", 401))
    // }

    // verify token
    try {
        //const decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY)
        // add user from payload
        req.user = await User.findById("67066ba3e8b7078725c6b940")
        next()
    } catch (error) {
        return next(new ErrorResponse(error.message, 401))
    }

}


const isAdmin = (req, res, next) => {
    if (req.user.admin === false) {
        return next(new ErrorResponse("Access denied, you must be an admin", 401))
    }
    next()
}


module.exports = { isAuthorized, isAdmin }