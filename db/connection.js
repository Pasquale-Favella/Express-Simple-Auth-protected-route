const Datastore = require("nedb");
const db = {};

db.users = new Datastore({ filename: "users.db", autoload: true });
db.expenses = new Datastore({ filename: "expenses.db", autoload: true });

module.exports = db;
