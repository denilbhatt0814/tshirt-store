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
app.use(fileUpload());

// morgan middleware - logging
app.use(morgan("tiny"));

//import all routes here
const home = require("./routes/home");

// routea middleware
app.use("/api/v1", home);

// exports app.js
module.exports = app;
