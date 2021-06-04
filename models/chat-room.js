const mongoose = require("mongoose");

const chatRoom = new mongoose.Schema(
  {
    title: String,
    participants: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [{ type: mongoose.Types.ObjectId, ref: "Message" }],
  },
  { timeStamps: true }
);

module.exports = mongoose.model("Room", chatRoom);
