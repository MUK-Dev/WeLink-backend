require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const HttpError = require("../models/http-error");
const User = require("../models/user");
const Rooms = require("../models/chat-room");
const util = require("../utils/generate-token");

//?---------------Register New User---------------------

const register = async (req, res, next) => {
	let existingUser;
	let token;

	const { name, email, phone, password } = req.body;

	// ! Checking If User with same email already exists
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(
			"Signing up failed, please try again later.",
			500
		);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError(
			"Email already in use, please try a different email address",
			422
		);
		return next(error);
	}
	//!-------------------------------------------------------

	// !Creating New User and generating a token with JWT
	bcrypt.hash(password, saltRounds, async (e, hash) => {
		if (!e) {
			const user = User({
				name,
				email,
				phone,
				rooms: [],
				password: hash,
			});

			try {
				await user.save();
			} catch (err) {
				const error = new HttpError("Couldn't Register, please try again", 500);
				return next(error);
			}
			token = util.genToken(user);
			// TODO Make the user active here by socket.io connection state
			res.send({
				message: "Successfully Registered",
				userInfo: {
					name: user.name,
					phone: user.phone,
					email: user.email,
				},
				rooms: [],
				token: token,
			});
		}
	});
	// !-------------------------------------------
};

//?------------------------------------------------------------

//?---------------Login Existing User---------------------

const login = async (req, res, next) => {
	let token;
	let userRooms = [];
	const { email, password } = req.body;
	try {
		await User.findOne({ email: email }, (err, foundUser) => {
			if (!err) {
				if (foundUser) {
					// TODO Make the user active here by socket.io connection state
					bcrypt.compare(password, foundUser.password, async (e, result) => {
						if (result === true) {
							token = util.genToken(foundUser);
							userRooms = await Rooms.find({
								participants: foundUser._id,
							});
							res.send({
								message: "Login Successful",
								userInfo: {
									_id: foundUser._id,
									name: foundUser.name,
									email: foundUser.email,
									phone: foundUser.phone,
								},
								rooms: userRooms,
								token: token,
							});
						} else if (e) {
							const error = new HttpError(
								"Couldn't Find User with the provided email...",
								404
							);
							return next(error);
						}
					});
				}
			}
		});
	} catch (err) {
		const error = new HttpError("Login Failed, please try again", 500);
		return next(error);
	}
};

//?------------------------------------------------------------

exports.register = register;
exports.login = login;
