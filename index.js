const express = require("express");
const volleyball = require("volleyball");

require("dotenv").config();

const app = express();

const { checkTokenSetUser, isLoggedIn } = require("./auth/middlewares");

const auth = require("./auth");
const expenses = require("./api/expenses");

app.use(volleyball);

app.use(express.json());
app.use(checkTokenSetUser);

app.get("/", (req, res) => {
  res.json({
    message: "Auth api",
    user: req.user,
  });
});

app.use("/auth", auth);
app.use("/api/expenses", isLoggedIn, expenses);

function notFound(req, res, next) {
  res.status(404);
  const error = new Error("Not Found - " + req.originalUrl);
  next(error);
}

function errorHandler(err, req, res, next) {
  res.status(res.statusCode || 500);
  res.json({
    message: err.message,
    stack: err.stack,
  });
}

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Listening on port", port);
});
