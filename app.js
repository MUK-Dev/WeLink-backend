require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authentication = require("./routes/authentication");
const chats = require("./routes/chats");

const app = express();
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Allow-Methods", "GET POST PATCH DELETE");
	next();
});

app.use(cors());

app.use(
	express.json({
		limit: 52428800,
	})
);
app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || "An unknown error occurred!" });
});

app.use(authentication);
app.use(chats);

//-------------------- Database Connection --------------------

mongoose
	.connect(process.env.DB_CONNECTION, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then(() => {
		const server = app.listen(5000, () => {
			console.log("Server running on port 5000");
		});
		const io = require("./socket").init(server);
		io.on("connection", (socket) => {
			console.log("Client connected");
		});
	})
	.catch((err) => {
		console.log(err);
	});

//------------------------------------------------------------
