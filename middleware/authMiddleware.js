const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Access deined." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const { user_name, user_id } = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    req.user = { user_name, user_id };
    next();
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Authentication Invalid." });
  }
}
module.exports = authMiddleware;
