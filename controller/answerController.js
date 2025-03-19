const dbConnection = require("../db/dbConfig"); // Database connection
const { StatusCodes } = require("http-status-codes");

// Function to get answers for a specific question
async function getAnswersForQuestion(req, res) {
  const { question_id } = req.params;
  // Validate question_id
  if (typeof question_id !== "string" || question_id.trim().length === 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Invalid question_id format" });
  }

  try {
    // Fetch answers for the given question_id
    const [answers] = await dbConnection.query(
      "SELECT * FROM answerTable WHERE question_id = ? ORDER BY createdAt DESC",
      [question_id]
    );

    if (answers.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "No answers found for this question" });
    }

    // Return specific fields to reduce payload size
    return res.status(StatusCodes.OK).json({
      answers: answers.map((answer) => ({
        answer_id: answer.answer_id,
        answer: answer.answer,
      })),
    });
  } catch (error) {
    console.error("Error fetching answers:", error.stack);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later!" });
  }
}

module.exports = { getAnswersForQuestion};