const Category = require("../models/Category");
const Course = require("../models/Course")
const asyncHandler = require("express-async-handler")
const cloudinary = require('../utils/cloudinary');

const displayCourses = asyncHandler(async (req, res, next) => {
    
    const pageSize = 4;
    const page = Number(req.query.pageNumber) || 1;

    const ids = await Category.find({}, { _id: 1 });

    const categories = req.query.category || ids.map(id => id._id);

    try {
        const count = await Course.countDocuments({ categories: { $in: categories } });
        const coursesList = await Course.find()
        .skip(pageSize * (page - 1)).limit(pageSize).select("-content")
        .populate({ path: "instructors", select: "name avatar courses followers" })
        .populate({ path: "categories", select: "name _id" })
        res.status(201).json({
            success: true,
            coursesList,
            page,
            pages: Math.ceil(count / pageSize),
            count,
            categories
        })
    } catch (error) {
        next(error)
    }
})


const createCourse = asyncHandler(async (req, res, next) => {
    const { name, categories, price, description, image, duration, level } = req.body
    try {
        const { public_id, secure_url } = await cloudinary.uploader.upload(image, {
            folder: "courses",
            // width: 300,
            // crop: "scale"
        })
        const course = await Course.create({ name, categories, price, description, image: { public_id, url: secure_url }, duration, level })
        await Category.updateMany({ _id: { $in: categories } }, { $push: { courses: course._id } })
        res.status(201).json({ success: true, message: "Course Added" })
    } catch (error) {
        next(error)
    }
})


const deleteCourse = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    try {
        await Course.findByIdAndDelete(id)
        await Category.updateMany({ }, { $pull: { courses: id } })
        res.status(201).json({ success: true, message: "Course deleted" })
    } catch (error) {
        next(error)
    }
})


const updateCourse = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const { name, categories, price, description, image, duration, level } = req.body
    try {
        if (image) {
            // is the previous uploaded image still there in cloudinary? how to delete it?
            const { public_id, secure_url } = await cloudinary.uploader.upload(image, {
                folder: "courses",
                // width: 300,
                // crop: "scale"
            })
            image = { public_id, url: secure_url }
        }
        await Course.findByIdAndUpdate(id, { name, categories, price, description, image, duration, level }, { runValidators: true })
        res.status(201).json({ success: true, message: "Course updated" })
    } catch (error) {
        next(error)
    }
})


const getCourse = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    try {
        const course = await Course.findById(id).select("-content")
        .populate({ path: "instructors", select: "name avatar courses followers" })
        .populate({ path: "categories", select: "name _id" })
        res.json({ success: true, course })
    } catch (error) {
        next(error)
    }
})


const getCourseContent = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    try {
        const content = await Course.findById(id, "content")
        // why do I have to go like this?
        res.json({ success: true, content: content.content })
    } catch (error) {
        next(error)
    }
})


module.exports = { displayCourses, createCourse, deleteCourse, updateCourse, getCourse, getCourseContent }