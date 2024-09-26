const { signupController, loginController, forgotPasswordController, resetPasswordController } = require("../controllers/userAuthentication");
const router = require("express").Router()


router.post("/signup", signupController)

router.post("/login", loginController)

router.post("/forgot-password", forgotPasswordController)

router.post("/reset-password/:id/:resetPasswordToken", resetPasswordController)


module.exports = router;