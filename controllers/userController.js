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
