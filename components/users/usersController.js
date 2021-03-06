const bcrypt = require("bcrypt");
const fs = require("fs");

// Initialize User Model
const UserModel = require("./user");

// Initialize Role Model
const RoleModel = require("../roles/role");

// Initialize Avatar Model
const AvatarModel = require("../files/Avatars/avatar");

// Initialize Generate Code Email (Utils)
const generationEmailCode = require("../../utils/generation/generationEmailCode/generationEmailCode");

// Initialize Token Service
const TokenService = require("../../utils/jwt/TokenService/tokenService");

// Initialize Mail Service
const MailService = require("../Mail/MailService");

// Initialize User Dto
const UserDto = require("../../dtos/UserDto");

// Initialize Avatar Dto
const AvatarDto = require("../../dtos/AvatarDto");

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
          message: "???????????????????????? ?? ?????????? email ?????? ????????????????????!",
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
          message: "???????????????????????? ?? ?????????? email ???? ????????????????????!",
        });
      }

      const verifyPassword = await bcrypt.compare(password, user.password);

      if (!verifyPassword) {
        return res.status(400).json({
          statusCode: 400,
          stringStatus: "Bad Request",
          message: "???????????????????????? email ?????? ????????????!",
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
          message: "???????????????????????? ???? ????????????????????!",
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
          "???? ???????? ?????????? ?????? ???????????????????? ?????? ?????? ???????????????????????????? ???????????? ???????????????? ?? Tempo",
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
          message: "???????????????????????? ???? ????????????????????!",
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
          message: "?????? ???????????? ??????????????! ????????????????????, ???????????????????? ?????? ??????!",
        });
      } else if (
        (user.emailVerifyCode === "" && code === "") ||
        code ||
        !code
      ) {
        return res.status(400).json({
          statusCode: 400,
          stringStatus: "Bad Request",
          message: "???? ?????? ?????????? ?? ??????????????!",
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
          message: "???????????????????????? ???? ????????????!",
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
          message: "???????????????????????? ???? ????????????!",
        });
      }

      const { email, username } = req.body;

      // TODO: ?????????????? ?????????????????? ?????? ?????????? ???????????????? ?? email ?? ???????????? ????????,
      // ?????????????? ?????????????????? ???? ???????????? ???????????? ?? ?????????????? ?? ??????????
      if (email) {
        user.email = email;
      }

      // TODO: ?????????????? ?????????????????? ?????? ?????????? ???????????????? ?? email ?? ???????????? ????????,
      // ?????????????? ?????????????????? ???? ???????????? ???????????? ?? ?????????????? ?? ??????????
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

  // * @route   POST http://localhost:5000/api/users/me/settings/upload-avatar
  // * @desc    Settings user profile upload avatar
  // * @access  Private
  async myProfileSettingsUploadAvatar(req, res) {
    try {
      const userId = req.user.id;

      const avatar = await AvatarModel.findOne({ user: userId });

      if (!avatar) {
        const { file } = req;

        if (!file) {
          return res.status(400).json({
            statusCode: 400,
            stringStatus: "Bad Request",
            message: "???????? ?? ???????????? ???? ??????????????!",
          });
        }

        const ext = file.originalname.split(".").pop();

        const newAvatar = await AvatarModel.create({
          filename: file.path.split("\\").pop(),
          ext: ext,
          utl: `${req.protocol}://${
            req.headers.host
          }/file/images/avatars/${file.path.split("\\").pop()}`,
          user: userId,
        });

        const avatarDto = new AvatarDto(newAvatar);

        await UserModel.updateOne(
          { _id: userId },
          {
            $set: {
              avatar: avatarDto.id,
            },
          }
        );

        return res.status(200).json({
          statusCode: 200,
          stringStatus: "OK, Success",
          message: {
            user: avatarDto.user,
            avatar: avatarDto,
          },
        });
      }

      fs.unlink(
        `./public/files/images/avatars/${avatar.filename}`,
        function (err) {
          if (err) {
            console.log(err);
            return res.status(400).json({
              statusCode: 400,
              stringStatus: "Bad Request",
              message: `Something went wrong! ${err}`,
            });
          }
        }
      );
      await AvatarModel.deleteOne({ user: userId });

      const { file } = req;

      if (!file) {
        return res.status(400).json({
          statusCode: 400,
          stringStatus: "Bad Request",
          message: "???????? ?? ???????????? ???? ??????????????!",
        });
      }

      const ext = file.originalname.split(".").pop();

      const newAvatar = await AvatarModel.create({
        filename: file.path.split("\\").pop(),
        ext: ext,
        url: `${req.protocol}://${
          req.headers.host
        }/files/images/avatars/${file.path.split("\\").pop()}`,
        user: userId,
      });

      const avatarDto = new AvatarDto(newAvatar);

      await UserModel.updateOne(
        { _id: userId },
        {
          $set: {
            avatar: avatarDto.id,
          },
        }
      );

      return res.status(200).json({
        statusCode: 200,
        stringStatus: "OK, Success",
        message: {
          user: avatarDto.user,
          avatar: avatarDto,
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
