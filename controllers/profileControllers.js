const User = require("../models/User");
const Course = require("../models/Course");
const asyncHandler = require("express-async-handler");
const ErrorResponse = require("../utils/errorResponse");
const cloudinary = require('../utils/cloudinary');
const Joi = require("joi");

const updateProfileSchema = Joi.object({
    name: Joi.string().trim().min(3).max(32),
    email: Joi.string().trim().email(),
    avatar: Joi.string(),
    password: Joi.string(),
    confirmPassword: Joi.string()
})


const getProfile = asyncHandler(async (req, res, next) => {
    const { id } = req.user
    try {
        const user = await User.findById(id).populate("following", "name avatar courses followers")
        .populate("followers", "name avatar courses followers")
        .populate({ path: "likedCourses", populate: [{ path: "instructors", select: "name avatar courses followers" }, { path: "categories", select: "name _id" }] })
        .populate({ path: "createdCourses", populate: [{ path: "instructors", select: "name avatar courses followers" }, { path: "categories", select: "name _id" }] })
        .populate({ path: "courses", populate: { path: "course", select: "-content", populate: [{ path: "instructors", select: "name avatar courses followers" }, { path: "categories", select: "name _id" }] } })
        res.json({ success: true, user: {
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
    } catch (error) {
        next(error)
    }
})


const updateProfile = asyncHandler(async (req, res, next) => {
    const { id } = req.user

    
    // TODO: limit update to allowed fields
    try {
        if (Object.keys(req.body).length === 0) {
            throw new ErrorResponse("No changes provided", 400)
        }
    
        const { error } = updateProfileSchema.validate(req.body)
        if (error) {
            throw new ErrorResponse(error.details[0].message, 400)
        }

        if (req.body.email) {
            const userExists = await User.findOne({ email: req.body.email })
            if (userExists) {
                throw new ErrorResponse("Email already registered", 400)
            }
        }

        if (req.body.password) {
            if (req.body.password !== req.body.confirmPassword) {
                throw new ErrorResponse("Passwords do not match", 400)
            } else {
                const user = await User.findById(id)
                user.password = req.body.password
                await user.save();
                delete req.body.password
                delete req.body.confirmPassword
            }
        }

        if (req.body.avatar) {
            const { public_id, secure_url } = await cloudinary.uploader.upload(req.body.avatar, {
                folder: "users",
                // width: 300,
                // crop: "scale"
            })
            req.body.avatar = { public_id, url: secure_url }
        }
        await User.findByIdAndUpdate(id, req.body)
        res.json({ success: true, message: "Profile updated" })
    } catch (error) {
        next(error)
    }
})


const deleteProfile = asyncHandler(async (req, res, next) => {
    const { id } = req.user
    try {
       await User.findByIdAndDelete(id) 
       res.json({ success: true, message: "Your account has been deleted" })
    } catch (error) {
        next(error)
    }
})


const addCourse = asyncHandler(async (req, res, next) => {
    const { id } = req.user
    const { course } = req.body
    try {
        if (await Course.findById(course).countDocuments() === 0) {
            throw new ErrorResponse("Course not found", 404)
        }

        const courses = await User.findById(id, "courses")
        if (courses.courses.find((c) => c.course.toString() === course.toString())) {
            throw new ErrorResponse("You are already enrolled in this course", 400)
        }

        const user = await User.findByIdAndUpdate(id, { $push: { courses: { course: course, progress: 0 } } }, { new: true, runValidators: true })
        .populate({ path: "courses", select: "-content", populate: [{ path: "instructors", select: "name avatar courses followers" }, { path: "categories", select: "name _id" }] })
        res.json({ success: true, courses: user.courses })
    } catch (error) {
        next(error)
    }
})


const removeCourse = asyncHandler(async (req, res, next) => {
    const { id } = req.user
    const { course } = req.body
    try {

        if (await Course.findById(course).countDocuments() === 0) {
            throw new ErrorResponse("Course not found", 404)
        }

        const courses = await User.findById(id, "courses")
        if (!courses.courses.find((c) => c.course.toString() === course.toString())) {
            throw new ErrorResponse("You are not enrolled in this course", 400)
        }

        const user = await User.findByIdAndUpdate(id, { $pull: { courses: { course: course } } }, { new: true, runValidators: true })
        .populate({ path: "courses", select: "-content", populate: [{ path: "instructors", select: "name avatar courses followers" }, { path: "categories", select: "name _id" }] })
        res.json({ success: true, courses: user.courses })
    } catch (error) {
        next(error)
    }
})


const likeCourse = asyncHandler(async (req, res, next) => {
    const { id } = req.user
    const { course } = req.body
    try {
        
        if (await Course.findById(course).countDocuments() === 0) {
            throw new ErrorResponse("Course not found", 404)
        }

        const likedCourses = await User.findById(id, "likedCourses")
        if (likedCourses.likedCourses.includes(course)) {
            throw new ErrorResponse("You have already liked this course", 400)
        }

        const user = await User.findByIdAndUpdate(id, { $push: { likedCourses: course } }, { new: true, runValidators: true })
        .populate({ path: "likedCourses", select: "-content", populate: [{ path: "instructors", select: "name avatar courses followers" }, { path: "categories", select: "name _id" }] })
        await Course.findByIdAndUpdate(course, { $inc: { likes: 1 } })
        res.json({ success: true, likedCourses: user.likedCourses })
    } catch (error) {
        next(error)
    }
})


const unlikeCourse = asyncHandler(async (req, res, next) => {
    const { id } = req.user
    const { course } = req.body
    try {

        if (await Course.findById(course).countDocuments() === 0) {
            throw new ErrorResponse("Course not found", 404)
        }

        const likedCourses = await User.findById(id, "likedCourses")
        if (!likedCourses.likedCourses.includes(course)) {
            throw new ErrorResponse("You have not liked this course", 400)
        }

        const user = await User.findByIdAndUpdate(id, { $pull: { likedCourses: course } }, { new: true, runValidators: true })
        .populate({ path: "likedCourses", select: "-content", populate: [{ path: "instructors", select: "name avatar courses followers" }, { path: "categories", select: "name _id" }] })
        await Course.findByIdAndUpdate(course, { $inc: { likes: -1 } })
        res.json({ success: true, likedCourses: user.likedCourses })

    } catch (error) {
        next(error)
    }
})


const updateProgress = asyncHandler(async (req, res, next) => {
    const { id } = req.user
    const { course, progress } = req.body
    try {
        const user = await User.findByIdAndUpdate(id, { $set: { "courses.$[course].progress": progress } }, {
            new: true,
            arrayFilters: [ { "course.course": course } ],
            runValidators: true
        })
        res.json({ success: true, courses: user.courses })
    } catch (error) {
        next(error)
    }
})


const followUser = asyncHandler(async (req, res, next) => {
    // TODO: check if user is already following
    const { id } = req.user
    const { userId } = req.body
    try {
        if (id === userId) {
            throw new ErrorResponse("You can't follow yourself", 400)
        }

        if (await User.findById(userId).countDocuments() === 0) {
            throw new ErrorResponse("User not found", 404)
        }

        const following = await User.findById(id, "following")
        if (following.following.includes(userId)) {
            throw new ErrorResponse("You are already following this user", 400)
        }
        
        const user = await User.findByIdAndUpdate(id, { $push: { following: userId } }, { new: true, runValidators: true })
        .populate("following", "name avatar courses followers").populate("followers", "name avatar courses followers")
        await User.findByIdAndUpdate(userId, { $push: { followers: id } }, { runValidators: true })
        res.json({ success: true, following: user.following })
    } catch (error) {
        next(error)
    }
})


const unfollowUser = asyncHandler(async (req, res, next) => {
    const { id } = req.user
    const { userId } = req.body
    try {
        if (await User.findById(userId).countDocuments() === 0) {
            throw new ErrorResponse("User not found", 404)
        }

        const following = await User.findById(id, "following")
        if (!following.following.includes(userId)) {
            throw new ErrorResponse("You are not following this user", 400)
        }
        const user = await User.findByIdAndUpdate(id, { $pull: { following: userId } }, { new: true, runValidators: true })
        .populate("following", "name avatar courses followers").populate("followers", "name avatar courses followers")
        await User.findByIdAndUpdate(userId, { $pull: { followers: id } }, { runValidators: true })
        res.json({ success: true, following: user.following })
    } catch (error) {
        next(error)
    }
})


module.exports = {
    getProfile,
    updateProfile,
    deleteProfile,
    addCourse,
    removeCourse,
    likeCourse,
    unlikeCourse,
    updateProgress,
    followUser,
    unfollowUser
}