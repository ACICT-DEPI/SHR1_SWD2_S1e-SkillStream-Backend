const router = require("express").Router()
const { displayCourses, updateCourse, deleteCourse, createCourse, getCourse, getCourseContent } = require("../controllers/courseControllers")


router.route("/").get(displayCourses).post(createCourse)
router.route("/:id").get(getCourse).put(updateCourse).delete(deleteCourse)
router.route("/:id/content").get(getCourseContent)


module.exports = router