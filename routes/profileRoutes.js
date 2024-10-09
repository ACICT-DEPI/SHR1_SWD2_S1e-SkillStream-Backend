const { getProfile, updateProfile, deleteProfile, addCourse, removeCourse, likeCourse, unlikeCourse, updateProgress, followUser, unfollowUser } = require("../controllers/profileControllers");
const router = require("express").Router()


// Profile routes

router.get("/", getProfile)

router.put("/", updateProfile)

router.delete("/", deleteProfile)

router.put("/add-course", addCourse)

router.put("/remove-course", removeCourse)

router.put("/like-course", likeCourse)

router.put("/unlike-course", unlikeCourse)

router.put("/follow-user", followUser)

router.put("/unfollow-user", unfollowUser)

router.put("/update-progress", updateProgress)


module.exports = router