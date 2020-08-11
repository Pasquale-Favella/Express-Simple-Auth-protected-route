const { body } = require("express-validator");
const schema = [
  body("username").isLength({ min: 2, max: 20 }),

  body("password").isLength({ min: 8 }),
];

module.exports = schema;
