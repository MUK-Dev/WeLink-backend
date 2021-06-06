const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Room = require("../models/chat-room");
const User = require("../models/user");
const Message = require("../models/message");
const io = require("../socket");

//* Things Done Here:
//* 1) Creating New Chat Room
//* 2) Sending New Message in chat room
//* 3) Getting All Messages of a chat room

//?---------------Register New User---------------------

const createNewRoom = async (req, res, next) => {
	const { title, participants } = req.body;
	let chatRooms;

	// !Check if the conversation between two users exist

	try {
		if (!title) {
			chatRooms = await Room.findOne({ participants: { $eq: participants } });
		}
	} catch (err) {
		const error = new HttpError("Couldn't Create Chat Room", 500);
		return next(error);
	}
	if (chatRooms) {
		const error = new HttpError("Chat Room Already Exists", 400);
		return next(error);
	}

	// !--------------------------------------------------------

	// !Creating a group chat if title is sent from the backend

	let users = [];
	try {
		users = await User.find({ _id: { $in: participants } });
	} catch (err) {
		const error = new HttpError("Couldn't create chat room", 500);
		return next(error);
	}

	if (title && users) {
		const chatRoom = Room({
			title,
			participants,
			messages: [],
		});
		try {
			const sess = await mongoose.startSession();
			sess.startTransaction();
			await chatRoom.save({ session: sess });
			await User.updateMany(
				{ _id: { $in: participants } },
				{ $push: { rooms: chatRoom } }
			);
			res.send("Successfully Created New Chat Room");
			await sess.commitTransaction();
		} catch (err) {
			const error = new HttpError("Couldn't Create New Chat Room", 500);
			return next(error);
		}
		// !Creating Two Persons chat if title is not sent from the backend
	} else if (users) {
		const chatRoom = Room({
			participants,
			messages: [],
		});
		try {
			const sess = await mongoose.startSession();
			sess.startTransaction();
			await chatRoom.save({ session: sess });
			await User.updateMany(
				{ _id: { $in: participants } },
				{ $push: { rooms: chatRoom } }
			);
			res.send("Successfully Created New Chat Room");
			await sess.commitTransaction();
		} catch (err) {
			const error = new HttpError("Couldn't Create New Chat Room", 500);
			return next(error);
		}
	} else {
		const error = new HttpError("Couldn't Create New Chat Room", 500);
		return next(error);
	}

	// !-------------------------------------------------------
};

//?------------------------------------------------------------

//?----------------------Adding New Message-----------------

const newMessage = async (req, res, next) => {
	const { sender, text, roomId } = req.body;
	let chat;
	try {
		chat = await Room.findById(roomId);
	} catch (err) {
		const error = new HttpError("Couldn't send message", 500);
		return next(error);
	}
	if (chat) {
		const message = Message({
			sender,
			text,
			roomId,
		});
		try {
			const sess = await mongoose.startSession();
			sess.startTransaction();
			await message.save({ session: sess });
			await Room.findByIdAndUpdate(roomId, { $push: { messages: message } });
			io.getIO().emit("message", { action: "newMessage", message: message });
			res.send("Message Sent");
			await sess.commitTransaction();
		} catch (err) {
			const error = new HttpError("Couldn't send message", 500);
			return next(error);
		}
	}
};

//?------------------------------------------------------------

//?----------------Get The Selected Chat's messages----------------------

const getMessages = async (req, res, next) => {
	const roomId = req.params.roomId;
	let messages;
	try {
		messages = await Message.find({ roomId: roomId }).sort({
			createdAt: "ascending",
		});
	} catch (err) {
		const error = new HttpError("Couldn't Send Message", 500);
		return next(error);
	}
	res.send(messages);
};

//?----------------------------------------------------------------------

exports.createNewRoom = createNewRoom;
exports.newMessage = newMessage;
exports.getMessages = getMessages;
