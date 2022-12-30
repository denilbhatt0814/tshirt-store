const CustomError = require("../utils/customError");
const BigPromise = require("../middlewares/bigPromise");
const Product = require("../models/product");
const cloudinary = require("cloudinary").v2;

exports.addProduct = BigPromise(async (req, res, next) => {
  // images
  let imageArray = [];
  if (!req.files) {
    return next(new CustomError("images are required", 401));
  }

  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let file = req.files.photos[index]; // frontend must call this a photo
      let result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "products",
      });

      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});
