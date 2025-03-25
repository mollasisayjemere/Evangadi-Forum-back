const express = require("express");
const router = express.Router();

// user controllers
const {
  register,
  login,
  checkUser,
  forgetPassword,
} = require("../controller/userController.js");

const authMiddleware = require("../middleware/authMiddleware.js");

// register user route
router.post("/register", register);

// login user route
router.post("/login", login);

// Forget Password
router.post("/forget-password", forgetPassword);

// check user route
router.get("/check", authMiddleware, checkUser);

module.exports = router;
