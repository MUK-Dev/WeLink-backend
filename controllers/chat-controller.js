const HttpError = require("../models/http-error");
const Room = require("../models/chat-room");
const User = require("../models/user");

//?---------------Register New User---------------------

const createNewRoom = async (req, res, next) => {
  const { title, participants } = req.body;
  let chatRooms;
  // !Check if the conversation between two users exist
  try {
    chatRooms = Room.find({ participants: { $in: participants } });
  } catch (err) {
    const error = new HttpError("Couldn't Create Chat Room", 500);
    return next(error);
  }
  if (chatRooms) {
    const error = new HttpError("Chat Room Already Exists", 400);
    return next(error);
  }
  // !--------------------------------------------------------
};

//?------------------------------------------------------------
