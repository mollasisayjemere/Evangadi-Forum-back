const dbConnection = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const crypto = require("crypto"); // For generating a secure reset token
const nodemailer = require("nodemailer"); // For sending emails
const moment = require("moment");
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
      .json({ msg: "user login successful", token });
  } catch (error) {
    // Log and handle any errors
    console.error("Error:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later!" });
  }
}

// const forgetPassword = async function forgetPassword(req, res) {
//   const { email } = req.body;

//   // Check if email is provided
//   if (!email) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ msg: "Enter your email address." });
//   }

//   try {
//     // Query to check if the email exists in the database
//     const [existingUser] = await dbConnection.query(
//       "SELECT email FROM userTable WHERE email = ?",
//       [email]
//     );

//     // If email exists, proceed with password reset logic (e.g., sending reset link)
//     if (existingUser.length > 0) {
//       // Example of sending reset email (this part can be customized)
//       // await sendResetEmail(email);

//       return res.status(StatusCodes.OK).json({
//         msg: "Password reset email has been sent. Please check your inbox.",
//       });
//     }

//     // If the email is not found in the database
//     return res
//       .status(StatusCodes.NOT_FOUND)
//       .json({ msg: "Email does not exist in our records" });
//   } catch (error) {
//     console.error("Error:", error.message);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ msg: "Something went wrong. Please try again later." });
//   }
// };

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "An email is required" });
  }

  try {
    const [existingUser] = await dbConnection.query(
      "SELECT user_id, email FROM userTable WHERE email = ?",
      [email]
    );

    if (existingUser.length === 0) {
      return res
        .status(404)
        .json({ msg: "Email does not exist in our records" });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    // const resetTokenExpire = Date.now() + 3600000; // Token valid for 1 hour
    const resetTokenExpire = moment(Date.now() + 3600000).format(
      "YYYY-MM-DD HH:mm:ss"
    );

    // Save the token to the database
    await dbConnection.query(
      "UPDATE userTable SET resetToken = ?, resetTokenExpire = ? WHERE email = ?",
      [resetToken, resetTokenExpire, email]
    );

    // Send the password reset email
    await sendResetEmail(email, resetToken);

    res.status(200).json({
      msg: "Password reset email has been sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ msg: "Something went wrong. Please try again later." });
  }
};

// Function to send reset email
async function sendResetEmail(email, resetToken) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use Gmail's SMTP service
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail email address
      pass: process.env.EMAIL_PASS, // Your Gmail app password (if 2FA is enabled)
    },
    secure: true, // Use secure connection for port 465 (Gmail uses this port for secure SMTP)
    tls: {
      rejectUnauthorized: true, // Only needed if your server requires it
    },
    logger: true, // Enable logging (for debugging)
    debug: true, // Enable debug messages (for debugging)
  });

  // Password reset URL with the token
  const resetUrl = `https://localhost:5173/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: "no-reply@localhost:3456", // Your email address (can be any address)
    to: email, // Recipient's email
    subject: "Password Reset Request", // Email subject
    html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`, // Email body with reset link
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully.");
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
}


async function checkUser(req, res) {
  const user_name = req.user.user_name;
  const user_id = req.user.user_id;
  res.status(StatusCodes.OK).json({ msg: "valid user", user_name, user_id });
}

module.exports = { register, login, checkUser, forgetPassword };
