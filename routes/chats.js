const express = require("express");

const chatController = require("../controllers/chat-controller");

const router = express.Router();

router.route("/message").post(chatController.newMessage);

router.route("/message/:roomId").get(chatController.getMessages);

module.exports = router;
