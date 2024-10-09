const router = require("express").Router()
const { displayCourses, updateCourse, deleteCourse, createCourse, getCourse } = require("../controllers/courseControllers")


router.route("/").get(displayCourses).post(createCourse)
router.route("/:id").get(getCourse).put(updateCourse).delete(deleteCourse)


module.exports = router