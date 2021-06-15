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

//?---------------Create New Chat---------------------

const createNewRoom = async (title, participants, sender, text, res, next) => {
	// !Creating a group chat if title is sent from the backend

	let users = [];
	try {
		users = await User.find({ _id: { $in: participants } });
	} catch (err) {
		const error = new HttpError("Couldn't create chat room 1", 500);
		return next(error);
	}

	if (title && users) {
		const chatRoom = Room({
			title,
			participants,
			messages: [],
		});
		const message = Message({
			sender,
			text,
			roomId: chatRoom,
		});
		try {
			await message.save();
		} catch (err) {
			console.log(err);
			const error = new HttpError("Couldn't send Message", 500);
			return next(error);
		}
		try {
			const sess = await mongoose.startSession();
			sess.startTransaction();
			await chatRoom.save({ session: sess });
			await User.updateMany(
				{ _id: { $in: participants } },
				{ $push: { rooms: chatRoom } }
			);
			await sess.commitTransaction();
		} catch (err) {
			const error = new HttpError("Couldn't Create New Chat Room 2", 500);
			return next(error);
		}
		try {
			await Room.findByIdAndUpdate(chatRoom._id, {
				$push: { messages: message },
			});
		} catch (err) {
			console.log(err);
			const error = new HttpError("Couldn't Create New Chat Room 2.5", 500);
			return next(error);
		}
		try {
			let foundRoom = await Room.findById(chatRoom._id);
			io.getIO().emit("newChat", {
				participants: foundRoom.participants,
				foundRoom,
			});
			res.send("Successfully Created New Chat Room");
		} catch (err) {
			console.log(err);
			const error = new HttpError("Couldn't Create New Chat Room 3.5", 500);
			return next(error);
		}
		// !Creating Two Persons chat if title is not sent from the backend
	} else if (users) {
		const chatRoom = Room({
			participants,
			messages: [],
		});
		const message = Message({
			sender,
			text,
			roomId: chatRoom,
		});
		try {
			await message.save();
		} catch (err) {
			console.log(err);
			const error = new HttpError("Couldn't send Message", 500);
			return next(error);
		}

		try {
			const sess = await mongoose.startSession();
			sess.startTransaction();
			await chatRoom.save({ session: sess });
			await User.updateMany(
				{ _id: { $in: participants } },
				{ $push: { rooms: chatRoom } }
			);
			await sess.commitTransaction();
		} catch (err) {
			console.log(err);
			const error = new HttpError("Couldn't Create New Chat Room 3", 500);
			return next(error);
		}
		try {
			await Room.findByIdAndUpdate(chatRoom._id, {
				$push: { messages: message },
			});
		} catch (err) {
			console.log(err);
			const error = new HttpError("Couldn't Create New Chat Room 3.5", 500);
			return next(error);
		}
		try {
			let foundRoom = await Room.findById(chatRoom._id);
			//!Emit the newly created chat room from here to send it to participants of the room
			io.getIO().emit("newChat", {
				participants: foundRoom.participants,
				foundRoom,
			});

			res.send("Successfully Created New Chat Room");
		} catch (err) {
			console.log(err);
			const error = new HttpError("Couldn't Create New Chat Room 3.5", 500);
			return next(error);
		}
	} else {
		const error = new HttpError("Couldn't Create New Chat Room 4", 500);
		return next(error);
	}

	// !-------------------------------------------------------
};

//?------------------------------------------------------------

//?----------------------Adding New Message-----------------

const newMessage = async (req, res, next) => {
	const { sender, text, roomId, participants, title } = req.body;
	let chat;
	// !Check if the conversation between two users exist

	try {
		if (!title) {
			chat = await Room.findById(roomId);
		}
	} catch (err) {
		const error = new HttpError("Couldn't Send Message", 500);
		return next(error);
	}

	// !--------------------------------------------------------

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
			io.getIO().emit("newMessage", { roomId, message });
			res.send("Message Sent");
			await sess.commitTransaction();
		} catch (err) {
			const error = new HttpError("Couldn't send message", 500);
			return next(error);
		}
	} else {
		await createNewRoom(title, participants, sender, text, res, next);
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

exports.newMessage = newMessage;
exports.getMessages = getMessages;
