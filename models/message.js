const mongoose = require("mongoose");

const message = mongoose.Schema(
  {
    sender: String,
    message: String,
    room: { type: String, ref: "Room" },
  },
  { timeStamps: true }
);

module.exports = mongoose.Model("Message", message);
