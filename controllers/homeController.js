const BigPromise = require("../middlewares/bigPromise");

exports.home = BigPromise(async (req, res) => {
  // const db = await something();
  res.status(200).json({
    success: true,
    greeting: "Hellp from API",
  });
});

exports.homeDummy = (req, res) => {
  try {
    // const db = await something();

    res.status(200).json({
      success: true,
      greeting: "This is another dummy route",
    });
  } catch (error) {
    console.log(error);
  }
};

// It is ok to use any method with async await either
// use a BigPromise or put that peice of code in try-catch
// or 3rd way is to wrap promise around the only required peice of code
