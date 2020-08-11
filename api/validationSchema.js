const { body } = require("express-validator");
const schema = [
  body("title").isLength({ min: 2, max: 10 }),

  body("description").isLength({ min: 8 }),
  body("total").isNumeric(),
];

module.exports = schema;
