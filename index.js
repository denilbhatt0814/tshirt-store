const app = require("./app.js");
require("dotenv").config();

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port: ${process.env.PORT} `);
});
