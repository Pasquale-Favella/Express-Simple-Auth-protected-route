const express = require("express");
const { validationResult } = require("express-validator");
const db = require("../db/connection");
const schema = require("./validationSchema");

const expenses = db.expenses;

const router = express.Router();

router.get("/", (req, res) => {
  expenses.find(
    {
      user_id: req.user._id,
    },
    (err, expenses) => {
      res.json(expenses);
    }
  );
});

router.post("/", schema, (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    const expense = {
      ...req.body,
      user_id: req.user._id,
    };

    expenses.insert(expense, (err, exp) => {
      res.json(exp);
    });
  } else {
    res.status(422);
    const fwError = new Error(
      errors.array()[0].param + " " + errors.array()[0].msg
    );
    next(fwError);
  }
});

module.exports = router;
