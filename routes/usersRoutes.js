const { findUser } = require("../controllers/usersControllers")
const router = require("express").Router()


router.get("/find/:name", findUser)

module.exports = router