const express = require("express");
const router = express.Router();

// Connecting to multer
const multer = require("../../utils/multer/multer");

// Importing Controllers
const usersController = require("./usersController");

// Connecting Middlewares
const authMiddleware = require("../../middlewares/authMiddleware");

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

// * @route   GET http://localhost:5000/api/users/me
// * @desc    Get user profile
// * @access  Private
router.get("/me", authMiddleware, usersController.getMyProfile);

// * @route   PUT http://localhost:5000/api/users/me/settings
// * @desc    Settings user profile
// * @access  Private
router.put("/me/settings", authMiddleware, usersController.myProfileSettings);

// * @route   PUT http://localhost:5000/api/users/me/settings/upload-avatar
// * @desc    Settings user profile upload avatar
// * @access  Private
router.post(
  "/me/settings/upload-avatar",
  multer.single("file"),
  authMiddleware,
  usersController.myProfileSettingsUploadAvatar
);

module.exports = router;
