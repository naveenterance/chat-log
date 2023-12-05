const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://naveenterance:nst@cluster0.ytqaasm.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database connected successfully");
});
