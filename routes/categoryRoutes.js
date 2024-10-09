const router = require("express").Router()
const { getCategories, updateCategory, deleteCategory, createCategory, getCategory } = require("../controllers/categoryControllers")


router.route("/").get(getCategories).post(createCategory)
router.route("/:id").get(getCategory).put(updateCategory).delete(deleteCategory)


module.exports = router