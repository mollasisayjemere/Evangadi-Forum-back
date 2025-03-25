const dbConnection = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register function
const register = async (req, res) => {
  //   res.send("register");
  const { user_name, first_name, last_name, email, password } = req.body;

  if (!user_name || !first_name || !last_name || !email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide all required informaton" });
  }

  try {
    const registerData =
      "INSERT INTO userTable (user_name, first_name, last_name, email, password) VALUES(?,?,?,?,?)";
    const checkData =
      "SELECT user_name, user_id FROM userTable where user_name = ? or email = ?";

    const [user] = await dbConnection.query(checkData, [user_name, email]);
    if (user.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "User already registered.",
      });
    }
    if (password.length <= 8) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Password must be at least 8 characters" });
    }

    // encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await dbConnection.query(registerData, [
      user_name,
      first_name,
      last_name,
      email,
      hashedPassword,
    ]);
    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "User account created" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, please try again later!" });
  }
};
// Login function
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "please enter all required fields" });
  }
  try {
    const [user] = await dbConnection.query(
      "select user_name, user_id, password from userTable where email = ? ",
      [email]
    );
    console.log(user);
    if (user.length == 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "invalid credential" });
    }
    // compare password
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "invalid credential" });
    }
    const user_name = user[0].user_name;
    const user_id = user[0].user_id;
    const token = jwt.sign({ user_name, user_id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res
      .status(StatusCodes.OK)
      .json({ msg: "user login successful", user_name, user_id, token });
  } catch (error) {
    // Log and handle any errors
    console.error("Error:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later!" });
  }
}

const forgetPassword = async function forgetPassword(req, res) {
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "An email is required" });
  }

  try {
    // Query to check if the email exists in the database
    const [existingUser] = await dbConnection.query(
      "SELECT email FROM userTable WHERE email = ?",
      [email]
    );

    // If email exists, proceed with password reset logic (e.g., sending reset link)
    if (existingUser.length > 0) {
      // Example of sending reset email (this part can be customized)
      // await sendResetEmail(email);

      return res.status(StatusCodes.OK).json({
        msg: "Password reset email has been sent. Please check your inbox.",
      });
    }

    // If the email is not found in the database
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: "Email does not exist in our records" });
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong. Please try again later." });
  }
};

async function checkUser(req, res) {
  const user_name = req.user.user_name;
  const user_id = req.user.user_id;
  res.status(StatusCodes.OK).json({ msg: "valid user", user_name, user_id });
}

module.exports = { register, login, checkUser, forgetPassword };
