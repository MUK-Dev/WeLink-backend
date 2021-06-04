require("dotenv").config();
const jwt = require("jsonwebtoken");

const genToken = (user) => {
  let token;
  try {
    const tokenUser = {
      name: user.name,
      phone: user.phone,
      email: user.email,
    };
    token = jwt.sign({ tokenUser }, process.env.JWT_KEY, {
      expiresIn: "2h",
    });
    return token;
  } catch (err) {
    const error = new HttpError("Couldn't generate token", 500);
    return next(error);
  }
};

exports.genToken = genToken;
