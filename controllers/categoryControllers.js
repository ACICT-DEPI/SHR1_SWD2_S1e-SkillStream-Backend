const Category = require("../models/Category")
const asyncHandler = require("express-async-handler")


const getCategories = asyncHandler(async (req, res, next) => {
    try {
        const categories = await Category.find()
        res.json({ success: true, categories })
    } catch (error) {
        next(error)
    }
})


const createCategory = asyncHandler(async (req, res, next) => {
    const { name } = req.body
    try {
        await Category.create({ name })
        res.status(201).json({ success: true, message: "Category created" })
    } catch (error) {
        next(error)
    }
})


const deleteCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    try {
        await Category.findByIdAndDelete(id)
        res.status(201).json({ success: true, message: "Category deleted" })
    } catch (error) {
        next(error)
    }
})


const updateCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const { name } = req.body
    try {
        await Category.findByIdAndUpdate(id, { name })
        res.status(201).json({ success: true, message: "Category updated" })
    } catch (error) {
        next(error)
    }
})


const getCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    try {
        const category = await Category.findById(id)
        res.json({ success: true, category })
    } catch (error) {
        next(error)
    }
})


module.exports = { getCategories, createCategory, deleteCategory, updateCategory, getCategory }