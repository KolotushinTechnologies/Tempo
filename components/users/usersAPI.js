const express = require("express");
const router = express.Router();

const usersController = require("./usersController");

// * @route   GET http://localhost:5000/api/users/test
// * @desc    User route testing
// * @access  Public
router.get("/test", usersController.test);

// * @route   POST http://localhost:5000/api/users/registration
// * @desc    User registration
// * @access  Public
router.post("/registration", usersController.registration);

// * @route   GET http://localhost:5000/api/users/login
// * @desc    User login
// * @access  Public
router.post("/login", usersController.login);

// * @route   GET http://localhost:5000/api/users/auth/request-reset-password
// * @desc    User request reset password
// * @access  Public
router.post(
  "/auth/request-reset-password",
  usersController.authenticationRequestResetPassword
);

// * @route   GET http://localhost:5000/api/users/auth/reset-password
// * @desc    User reset password
// * @access  Public
router.post(
  "/auth/reset-password",
  usersController.authenticationResetPassword
);

module.exports = router;
