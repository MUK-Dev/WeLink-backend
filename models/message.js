const mongoose = require("mongoose");

const message = new mongoose.Schema(
	{
		sender: String,
		text: String,
		roomId: { type: mongoose.Types.ObjectId, ref: "Room" },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Message", message);
