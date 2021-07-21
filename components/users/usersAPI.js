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

module.exports = router;
