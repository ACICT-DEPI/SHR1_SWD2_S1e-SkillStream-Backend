const asyncHandler = require("express-async-handler")
const User = require("../models/User")
const ErrorResponse = require("../utils/errorResponse")


const findUser = asyncHandler(async (req, res, next) => {
        const { name } = req.params
        try {
            if (!name) {
                throw new ErrorResponse("Name is required", 400)
            }
            if (await User.find({ name: new RegExp(['^', name, '$'].join(''), "i") }).countDocuments() === 0) {
                throw new ErrorResponse("User not found", 404)
            }

            // TODO: add pagination
            // TODO: add sorting
            // TODO: make it find without typing the whole name remove $
            const users = await User.find({ name: new RegExp(['^', name, '$'].join(''), "i") }, "name avatar courses followers")
            res.json({ success: true, users })
        } catch (error) {
            next(error)
        }
    }
)


module.exports = { findUser }