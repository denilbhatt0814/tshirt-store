const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const app = express();

// for SWAGGER DOCs
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//regular middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookies and file middleware
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./temp/",
  })
);

app.set("view engine", "ejs");

// morgan middleware - logging
app.use(morgan("tiny"));

//import all routes here
const home = require("./routes/home");
const user = require("./routes/user");
const product = require("./routes/product");

// routea middleware
app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);

// test route
app.get("/signuptest", (req, res) => {
  res.render("signUpTest");
});

// exports app.js
module.exports = app;
