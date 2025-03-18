const dbConnection = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");
// Function to get all questions
async function getAllQuestions(req, res) {
  try {
    // Fetch all questions from the database
    const [questions] = await dbConnection.query(
      "SELECT * FROM questionTable ORDER BY id DESC"
    );
    // If no questions found, return a 404 response
    if (questions.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "No questions found" });
    }
    // Return the list of questions
    return res.status(StatusCodes.OK).json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later!" });
  }
}


module.exports = { getAllQuestions };