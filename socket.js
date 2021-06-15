const Room = require("./models/chat-room");
const HttpError = require("./models/http-error");
const User = require("./models/user");

let io;

module.exports = {
	init: (httpServer) => {
		io = require("socket.io")(httpServer, {
			cors: {
				origin: "*",
				methods: ["GET", "POST"],
			},
		});
		io.on("connection", async (socket) => {
			console.log("Client connected with id: ", socket.handshake.auth);
			socket.on("joinRooms", ({ username, rooms }) => {
				rooms.map((room) => {
					socket.join(room._id);
					socket.emit("message", `Bot says: Welcome Back`);
					socket.broadcast
						.to(room._id)
						.emit("message", `Bot says: ${username} is online`);
					socket.on("disconnect", () => {
						socket.broadcast
							.to(room._id)
							.emit("message", `Bot says: ${username} is offline now`);
					});
				});
			});
			socket.on("newMessage", (data) => {
				socket.to(data.roomId).emit("chatMessage", data.message);
			});
			socket.on("newChat", ({ participants, foundRoom }) => {
				participants.map((participant) => {
					if (participant === socket.handshake.auth.userID) {
						socket.emit("chatRoom", foundRoom);
					}
				});
			});
		});

		return io;
	},
	getIO: () => {
		if (!io) {
			throw new Error("Socket.io not initialized!");
		}
		return io;
	},
};
