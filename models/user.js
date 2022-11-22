const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxLength: [40, "Name should be under 40 charc"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    validator: [validator.isEmail, "Please provide email in correct format"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [6, "Password should be atleast 6 char"],
    select: false, // to restrict unecessary fetching of pass -> on require just use select tag and specify
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: { type: String },
    secure_url: { type: String },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// encrypt password before save - HOOKS
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// validate the password with userSent password
userSchema.methods.isValidPassword = async function (userSentPassword) {
  return await bcrypt.compare(userSentPassword, this.password);
};

// create and return jwt token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// generate forget password token (string)
userSchema.methods.getForgotPasswordToken = async function () {
  // generate a long and random string
  const forgotToken = crypto.randomBytes(20).toString("hex");

  // getting a hash -make sure to get a hash on backend as well
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest();

  // time of token
  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000; // 20 mins

  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);
