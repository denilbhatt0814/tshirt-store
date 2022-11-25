const User = require("../models/user");
const CustomeErr = require("../utils/customError");
const BigPromise = require("../middlewares/bigPromise");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  // getting token from the request
  // Multiple ways of providing cookies common for webApps but can also have in req.body or in Headers
  const token =
    req.cookies.token || req.headers(Authorization).replace("Bearer ", "");

  // if no token provided
  if (!token) {
    return next(new CustomeErr("Login first to access this resource", 401));
  }

  const decoded = jwt.verify(process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    user = {};
    return next(new CustomeErr("Token invalid", "401"));
  }

  next();
});
