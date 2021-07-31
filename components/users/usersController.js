const bcrypt = require("bcrypt");

// Initialize User Model
const UserModel = require("./user");

// Initialize Role Model
const RoleModel = require("../roles/role");

// Initialize Generate Code Email (Utils)
const generationEmailCode = require("../../utils/generation/generationEmailCode/generationEmailCode");

// Initialize Token Service
const TokenService = require("../../utils/jwt/TokenService/tokenService");

// Initialize Mail Service
const MailService = require("../Mail/MailService");

// Initialize User Dto
const UserDto = require("../../dtos/UserDto");

// Connecting validation for forms
const validateUsersRegistrationInput = require("../../utils/validation/users/usersRegistration");
const validateUsersLoginInput = require("../../utils/validation/users/usersLogin");

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

  // * @route   GET http://localhost:5000/api/users/login
  // * @desc    User login
  // * @access  Public
  async login(req, res) {
    try {
      // First section
      const { errors, isValid } = validateUsersLoginInput(req.body);

      // Validation
      if (!isValid) {
        return res.status(400).json({
          statusCode: 400,
          stringStatus: "Bad Request",
          message: errors,
        });
      }

      const { email, password } = req.body;

      const user = await UserModel.findOne({ email });

      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          stringStatus: "Not Found",
          message: "Пользователя с таким email не существует!",
        });
      }

      const verifyPassword = await bcrypt.compare(password, user.password);

      if (!verifyPassword) {
        return res.status(400).json({
          statusCode: 400,
          stringStatus: "Bad Request",
          message: "Неправильный email или пароль!",
        });
      }

      const userDto = new UserDto(user);
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

  // * @route   POST http://localhost:5000/api/users/auth/request-reset-password
  // * @desc    User request reset password
  // * @access  Public
  async authenticationRequestResetPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await UserModel.findOne({ email: email });

      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          stringStatus: "Not Found",
          message: "Пользователя не существует!",
        });
      }

      await UserModel.updateOne(
        { _id: user._id },
        {
          $set: {
            emailVerifyCode: generationEmailCode().toString(),
          },
        }
      );

      const existingUser = await UserModel.findOne({
        _id: user._id,
        email: email,
      });

      await MailService.sendResetPasswordEmailCode(
        email,
        existingUser.emailVerifyCode
      );

      return res.status(200).json({
        statusCode: 200,
        stringStatus: "OK, Success",
        message:
          "На Вашу почту был отпрпавлен код для восстановления пароля аккаунта в Tempo",
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

  // * @route   GET http://localhost:5000/api/users/auth/reset-password
  // * @desc    User reset password
  // * @access  Public
  async authenticationResetPassword(req, res) {
    try {
      const { email, newPassword, code } = req.body;

      const user = await UserModel.findOne({ email: email });

      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          stringStatus: "Not Found",
          message: "Пользователя не существует!",
        });
      }

      if (user.emailVerifyCode === code && user.emailVerifyCode !== "") {
        if (newPassword) {
          const hashNewPassword = await bcrypt.hash(newPassword, 3);
          await UserModel.updateOne(
            { _id: user._id, email: email },
            {
              $set: {
                password: hashNewPassword,
                emailVerifyCode: "",
              },
            }
          );
        }

        const updatedUser = await UserModel.findOne({
          _id: user._id,
          email: email,
        });

        const userDto = new UserDto(updatedUser);
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
      } else if (user.emailVerifyCode !== code && user.emailVerifyCode !== "") {
        return res.status(400).json({
          statusCode: 400,
          stringStatus: "Bad Request",
          message: "Код введен неверно! Пожалуйста, попробуйте еще раз!",
        });
      } else if (
        (user.emailVerifyCode === "" && code === "") ||
        code ||
        !code
      ) {
        return res.status(400).json({
          statusCode: 400,
          stringStatus: "Bad Request",
          message: "Вы уже вошли в аккаунт!",
        });
      }
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

  // * @route   GET http://localhost:5000/api/users/me
  // * @desc    Get user profile
  // * @access  Private
  async getMyProfile(req, res) {
    try {
      const user = await UserModel.findOne({ _id: req.user.id });

      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          stringStatus: "Not Found",
          message: "Пользователь не найден!",
        });
      }

      return res.status(200).json({
        statusCode: 200,
        stringStatus: "OK, Success",
        message: user,
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

  // * @route   PUT http://localhost:5000/api/users/me/settings
  // * @desc    Settings user profile
  // * @access  Private
  async myProfileSettings(req, res) {
    try {
      const user = await UserModel.findOne({ _id: req.user.id });

      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          stringStatus: "Not Found",
          message: "Пользователь не найден!",
        });
      }

      const { email, username } = req.body;

      // TODO: Сделать валидацию для ввода символов в email и другие поля,
      // сделать валидацию на пустые строки и пробелы в форме
      if (email) {
        user.email = email;
      }

      // TODO: Сделать валидацию для ввода символов в email и другие поля,
      // сделать валидацию на пустые строки и пробелы в форме
      if (username) {
        user.username = username;
      }

      user.save();

      return res.status(200).json({
        statusCode: 200,
        stringStatus: "OK, Success",
        message: {
          _id: user._id,
          email: user.email,
          username: user.username,
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
