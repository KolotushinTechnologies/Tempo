const bcrypt = require("bcrypt");

// Initialize User Model
const UserModel = require("./user");

// Initialize Role Model
const RoleModel = require("../roles/role");

// Initialize Token Service
const TokenService = require("../../utils/jwt/TokenService/tokenService");

// Initialize User Dto
const UserDto = require("../../dtos/UserDto");

// Connecting validation for forms
const validateUsersRegistrationInput = require("../../utils/validation/users/usersRegistration");

class UsersController {
  // * @route   GET http://localhost:5000/api/users/test
  // * @desc    User route testing
  // * @access  Public
  async test(req, res) {
    try {
      res.status(200).json({
        statusCode: 200,
        stringStatus: "OK, Success",
        message: "Users route testing was successfully!",
      });
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        stringStatus: "Bad Request",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      });
      console.log({
        statusCode: 500,
        stringStatus: "Error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      });
    }
  }

  // * @route   GET http://localhost:5000/api/users/registration
  // * @desc    User registration
  // * @access  Public
  async registration(req, res) {
    try {
      // First section
      const { errors, isValid } = validateUsersRegistrationInput(req.body);

      // Validation
      if (!isValid) {
        return res.status(400).json({
          statusCode: 400,
          stringStatus: "Bad Request",
          message: errors,
        });
      }

      const { email, password } = req.body;

      const userCandidate = await UserModel.findOne({ email: email });

      if (userCandidate) {
        return res.status(400).json({
          statusCode: 400,
          stringStatus: "Bad Request",
          message: "Пользователь с таким email уже существует!",
        });
      }

      const hashPassword = await bcrypt.hash(password, 3);

      const userRole = await RoleModel.findOne({ value: "USER" });

      const newUser = await UserModel.create({
        email: email,
        password: hashPassword,
        roles: [userRole.value],
      });

      const userDto = new UserDto(newUser);
      const tokens = TokenService.generateTokens({ ...userDto });
      await TokenService.saveToken(userDto.id, tokens.refreshToken);

      res.cookie(`refreshToken`, tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.status(200).json({
        statusCode: 200,
        stringStatus: "OK, Success",
        message: {
          ...tokens,
          user: userDto,
        },
      });
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        stringStatus: "Bad Request",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      });
      console.log({
        statusCode: 500,
        stringStatus: "Error",
        message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
      });
    }
  }
}

module.exports = new UsersController();
