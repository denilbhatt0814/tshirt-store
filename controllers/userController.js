const User = require("../models/user");
const CustomeErr = require("../utils/customError");
const BigPromise = require("../middlewares/bigPromise");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

exports.signup = BigPromise(async (req, res, next) => {
  let result;
  if (req.files) {
    let file = req.files.photo; // frontend must call this a photo
    result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  }

  const { name, email, password } = req.body;

  if (!email || !name || !password) {
    return next(new Error("Name, email and password are required"));
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new CustomeErr("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new CustomeErr("Email or password doesn't exist", 400));
  }

  const isCorrectPassword = await user.isValidPassword(password);
  if (!isCorrectPassword) {
    return next(new CustomeErr("Email or password doesn't exist", 400));
  }

  cookieToken(user, res);
});
exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logout success",
  });
});
