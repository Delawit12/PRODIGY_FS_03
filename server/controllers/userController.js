const User = require("../models/userModel");
const { jwtExpiresIn, jwtSecret } = require("../config/secret");
const catchAsync = require("../ErrorHandler/catchAsync");
const AppError = require("../ErrorHandler/appError");
const jwt = require("jsonwebtoken");

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, profilePic } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    return next(
      new AppError("user already exist with this email account", 400)
    );
  }

  const newUser = await User.create({
    name,
    email,
    password,
    profilePic,
  });

  token = jwt.sign(
    {
      id: newUser._id,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  res.status(201).json({
    data: {
      token,
      data: {
        newUser,
      },
      message: "user registered successfully",
    },
  });
});
