const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  message: String,
  date: Date,
});

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
