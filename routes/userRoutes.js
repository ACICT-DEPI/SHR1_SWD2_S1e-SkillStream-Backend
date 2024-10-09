const { signupController, loginController, forgotPasswordController, resetPasswordController, logoutController } = require("../controllers/userAuthentication");
const router = require("express").Router()

// Authentication routes
router.post("/signup", signupController)

router.post("/login", loginController)

router.post("/logout", logoutController)

router.post("/forgot-password", forgotPasswordController)

router.post("/reset-password/:id/:resetPasswordToken", resetPasswordController)



module.exports = router;