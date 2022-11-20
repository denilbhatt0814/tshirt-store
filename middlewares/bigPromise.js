// try catch and Async - Await ||use Promise

module.exports = (func) => (req, res, next) =>
  Promise.resolve(func(req, res, next)).catch(next);
