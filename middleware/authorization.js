const Jwt = require("jsonwebtoken")
const ErrorResponse = require("../utils/errorResponse")
const User = require("../models/User")
const BlackListedToken = require("../models/BlackListedToken")


const isAuthorized = async (req, res, next) => {

    let accessToken = req.get("Authorization")?.split(" ")[1]
    
    // check if access token doesn't exist or is expired
    if (!accessToken || !Jwt.verify(accessToken, process.env.JWT_SECRET_KEY)) {
        try {
            accessToken = await refreshAccessToken(req.cookies.refresh_token)
        } catch (error) {
            return next(new ErrorResponse(error.message, 401))
        }
        if (!accessToken) {
            return next(new ErrorResponse("unauthorized", 403))
        }
        res.set('Authorization', `Bearer ${accessToken}`);
    }
    
    try {
        // verify access token
        const decoded = Jwt.verify(accessToken, process.env.JWT_SECRET_KEY)
        // add user from payload
        req.user = await User.findById(decoded._id)
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


const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) return false
    // check if refresh token is blacklisted
    const isBlacklisted = await BlackListedToken.findOne({ token: refreshToken })
    if (isBlacklisted) return false
    try {
        const decoded = Jwt.verify(refreshToken, process.env.JWT_SECRET_KEY)
        const user = await User.findById(decoded._id)
        if (!user) return false
        const accessToken = Jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: Number.parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN) })
        return accessToken
    } catch (error) {
        return false
    }
}

module.exports = { isAuthorized, isAdmin }