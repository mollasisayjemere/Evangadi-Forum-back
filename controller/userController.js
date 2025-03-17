const dbConnection = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");


// Register function

// Login function

async function checkUser(req, res) {
  const user_name = req.user.user_name;
  const user_id = req.user.user_id;
  res.status(StatusCodes.OK).json({ msg: "valid user", user_name, user_id });
}

module.exports = { register, login, checkUser };
