const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    rooms: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Room",
      },
    ],
    password: String,
    is_active: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

// {
//     "name": "Sample User",
//     "email": "test@test.com",
//     "phone": "111222333",
//     "password": "123456"
// }
