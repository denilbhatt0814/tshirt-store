const User = require("../models/user");
const CustomeErr = require("../utils/customError");
const BigPromise = require("../middlewares/bigPromise");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const mailHelper = require("../utils/emailHelper");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

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

  // create and store user object
  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  // send JWT cookie for fututre use
  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new CustomeErr("Please provide email and password", 400));
  }

  // fetch user from db - EXISTANCE
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new CustomeErr("Email or password doesn't exist", 400));
  }

  // password validation
  const isCorrectPassword = await user.isValidPassword(password);
  if (!isCorrectPassword) {
    return next(new CustomeErr("Email or password doesn't exist", 400));
  }

  // generate and send cookie
  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  // Delete the prexisting cookie of user by sending a Stale cookie
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logout success",
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  // get the email
  const { email } = req.body;
  const user = await User.findOne({ email });

  // verify user existance
  if (!user) {
    return next(new CustomeErr(`Email not found registered`, 400));
  }

  // generate and store a forgotoken in db
  const forgotToken = await user.getForgotPasswordToken();
  await user.save({ validateBeforeSave: false });

  // mail the user with link to reset
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;
  const message = `Copy paste this link in your browser and hit enter \n \n ${myUrl}`;

  try {
    await mailHelper({
      email: user.email,
      subject: "LCO TStore - Password reset email",
      message,
    });

    res.status(200).json({
      success: true,
      message: "email sent succesfully",
    });
  } catch (error) {
    // In case we fail to send mail - FLUSH out token
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new CustomeErr(error.message, 500));
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  // encrypting the received token to match in DB
  const encryToken = crypto.createHash("sha256").update(token).digest();

  // search for a user holding this reset token
  // with token not expired yet
  const user = await User.findOne({
    forgotPasswordToken: encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomeErr(`Token is invalid or expired`, 400));
  }

  // Matching new password - CONFIRMATION
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomeErr(`password and confirm password don't match`, 400)
    );
  }

  // Setting new password in DB & flushing reset tokens
  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();

  // send a JSON response or send the Token
  cookieToken(user, res);
});
