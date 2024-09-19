const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const { jwtSecret, jwtExpiresIn } = require("../config/secret.js");
const jwt = require("jsonwebtoken");
const fs = require("fs");

// const Email = require("../utils/email.js");

const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (userId, email) => {
  return jwt.sign({ userId, email }, jwtSecret, { expiresIn: maxAge });
};
const authController = {
  signup: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const newUser = await User.create({
        email: email,
        password: password,
      });

      res.cookie("jwt", createToken(newUser._id, email), {
        maxAge,
        secure: true,
        sameSite: "None",
      });
      res.status(201).json({
        status: "success",
        user: newUser,
        message: "User register  successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: "An error occurred while creating the user",
        error: error.message,
      });
    }
  },
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      // check email and password are provided
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "email or password is not provided",
        });
      }
      // check the email already exist
      const user = await User.findOne({ email }).select("+password");
      console.log("user", user);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No account exists with this email",
        });
      }

      // check the password is the same

      const dbPassword = user.password;
      // console.log(dbPassword);
      const isMatch = await user.correctPassword(password, dbPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect password",
        });
      }
      //  remove the password =require() view
      user.password = undefined;

      res.cookie("jwt", createToken(user._id, email), {
        maxAge,
        secure: true,
        sameSite: "None",
      });

      // login response
      res.status(200).json({
        status: "success",
        user,
        message: "Login successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: "An error occurred while login a user",
      });
    }
  },
  logout: async (req, res, next) => {
    try {
      res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      });

      // response
      res
        .status(200)
        .json({ status: "success", message: "logged out successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "Failed",
        message: "An error occurred while logout a user",
      });
    }
  },
  forgetPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      // Get the user by using the provided email
      const user = await User.findOne({ email });
      console.log("User found:", user);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No user found with that email address.",
        });
      }

      // Generate a random OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.passwordResetOtp = otp;
      console.log("otp", otp);
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save({ validateBeforeSave: false });

      try {
        await Email(user.email, otp);
        res.status(200).json({
          status: "success",
          message: "OTP sent to email!",
        });
      } catch (err) {
        console.error("Error sending OTP email:", err);
        user.passwordResetOtp = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({
          success: false,
          message: "There was an error sending the OTP. Try again later.",
        });
      }
    } catch (error) {
      console.error("Error in forgetPassword:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while processing your request.",
      });
    }
  },
  otpVerification: async (req, res, next) => {
    try {
      const { email, otp } = req.body;

      const user = await User.findOne({ email });

      if (
        !user ||
        user.passwordResetOtp !== otp ||
        user.passwordResetExpires < Date.now()
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP. Please request a new OTP.",
        });
      }

      res.status(200).json({
        success: true,
        message: "OTP verified successfully.",
      });
    } catch (error) {
      console.error("Error in otpVerification:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while verifying the OTP.",
        error: error.message,
      });
    }
  },
  resetPassword: async (req, res, next) => {
    try {
      // Get the email , otp and password
      const { email, otp, password, passwordConfirm } = req.body;

      console.log("otp", otp);

      const user = await User.findOne({ email });
      console.log("user", user);
      if (!user || user.passwordResetOtp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP. Please request a new OTP.",
        });
      }
      // Update user's password
      user.password = password;
      user.passwordConfirm = passwordConfirm;
      user.passwordResetOtp = undefined;
      user.passwordResetExpires = undefined;

      await user.save();

      res.status(200).json({
        status: "success",
        message: "Password reset successfully.",
      });
    } catch (error) {
      console.error("Error in resetPassword:", error);
      console.log("Error in resetPassword:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while processing resetPassword.",
        error: error.message,
      });
    }
  },
  updatePassword: async (req, res, next) => {
    try {
      // const id = req.body.id;
      const { id, email, password, passwordConfirm } = req.body;
      // all are required
      if (!id || !email || !password || !passwordConfirm) {
        return res.status(400).json({
          success: false,
          message: "All fields are required ",
        });
      }

      // get user data by email with the password too
      const user = await User.findOne({ email }).select("+password");
      // console.log("user", user);

      //  compare the db password with the provided one
      const storedPassword = user.password;
      const isSame = await bcrypt.compare(password, storedPassword);

      // check previously used or not
      if (isSame) {
        return res.status(400).json({
          success: false,
          message: "Password previously used",
        });
      }
      // if is not previously used , update the password
      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;

      await user.save();

      user.password = undefined;
      // console.log("user", user);

      res.status(200).json({
        status: "success",
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("Error in updatePassword:", error);
      console.log("Error in updatePassword:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while processing updatePassword.",
        error: error.message,
      });
    }
  },
  getSingleUser: async (req, res, next) => {
    try {
      // find a user by using id
      console.log(req.id);
      const user = await User.findById(req.id);
      if (!user) {
        return res.status(404).json({
          status: "Failed",
          message: "No user found with that ID",
        });
      }
      // send response
      return res.status(200).json({
        status: "success",
        user: user,
      });
    } catch (error) {
      console.log("Error in fetching user:", error);
      return res.status(500).json({
        status: "Failed",
        message: "An error occurred while fetching  user",
      });
    }
  },
  updateProfile: async (req, res, next) => {
    try {
      const id = req.id;
      const { firstName, lastName, color } = req.body;
      if (!firstName || !lastName) {
        return res.status(400).json({
          status: "bad request",
          message: "All fields are required",
        });
      }
      const user = await User.findByIdAndUpdate(
        id,
        {
          firstName: firstName,
          lastName: lastName,
          color: color,
          profileSetup: true,
        },
        {
          new: true,
          runValidators: true,
        }
      );
      console.log(user);
      if (!user) {
        return res.status(404).json({
          status: "Failed",
          message: "No user is  found ",
        });
      }
      // send response
      return res.status(200).json({
        status: "success",
        data: {
          user: user,
        },
      });
    } catch (error) {
      console.log("Error in updating user:", error);
      return res.status(500).json({
        status: "Failed",
        message: "An error occurred while updating user",
      });
    }
  },
  updateProfileImage: async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        status: "bad request",
        message: "File is required",
      });
    }
    let profilePicture;
    console.log("req.files", req.file);
    console.log("req.files", req.file.fieldname);
    if (req.file && req.file.fieldname === "profileImage") {
      profilePicture = req.file.path;
      // profilePicture = req.file.profileImage[0].path;
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.id,
      { profilePic: profilePicture },
      { new: true, runValidators: true }
    );
    console.log("profile", updatedUser);
    res.status(200).json({
      status: "success",
      message: "profile updated successfully",
      user: { updatedUser },
    });
  },
  removeProfileImage: async (req, res, next) => {
    const id = req.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({
        message: "User Not Found",
      });
    }
    if (user.profilePic) {
      fs.unlinkSync(user.profilePic);
    }
    user.profilePic = null;
    await user.save();
    res.status(200).json({
      status: "success",
      message: "profile image removed successfully",
    });
  },
};

module.exports = authController;
