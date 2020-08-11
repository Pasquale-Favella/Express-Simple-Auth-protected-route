const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const schema = require("./validationSchema");

const db = require("../db/connection");
const users = db.users;
users.ensureIndex({ fieldName: "username", unique: true }, (err) => {
  if (err) console.log(err);
});
const router = express.Router();

function respondError404(res, next) {
  res.status(404);
  const error = new Error("Unable to login.");
  next(error);
}

function createTokenSendResponse(user, res, next) {
  const payload = {
    _id: user._id,
    username: user.username,
  };

  jwt.sign(
    payload,
    process.env.TOKEN_SECRET,
    {
      expiresIn: "1d",
    },
    (err, token) => {
      if (err) {
        respondError404(res, next);
      } else {
        res.json({
          token,
        });
      }
    }
  );
}

router.get("/", (req, res) => {
  res.json({
    message: "Auth route 🔐",
  });
});

router.post("/signup", schema, (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    users.findOne(
      {
        username: req.body.username,
      },
      (err, user) => {
        // check if username already in use
        if (user) {
          const error = new Error("Username already in use.");
          res.status(409);
          next(error);
        } else {
          // hash the password
          bcrypt.hash(req.body.password.trim(), 12).then((hashedPassword) => {
            // insert the user with the hashed password
            const newUser = {
              username: req.body.username,
              password: hashedPassword,
            };

            users.insert(newUser, (err, insertedUser) => {
              createTokenSendResponse(insertedUser, res, next);
            });
          });
        }
      }
    );
  } else {
    res.status(422);
    const fwError = new Error(
      errors.array()[0].param + " " + errors.array()[0].msg
    );
    next(fwError);
  }
});

router.post("/login", schema, (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    users.findOne(
      {
        username: req.body.username,
      },
      (err, user) => {
        if (user) {
          bcrypt.compare(req.body.password, user.password).then((result) => {
            if (result) {
              createTokenSendResponse(user, res, next);
            } else {
              respondError404(res, next);
            }
          });
        } else {
          respondError404(res, next);
        }
      }
    );
  } else {
    respondError404(res, next);
  }
});

module.exports = router;
