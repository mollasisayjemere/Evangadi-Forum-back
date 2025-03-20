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

// Function to post an answer for a specific question
async function postAnswer(req, res) {
  const { question_id, user_id, answer } = req.body; // Use question_id, user_id, and answer to match schema

  // Validate inputs
  if (!question_id || !user_id || !answer) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide question_id, user_id, and answer" });
  }

  if (typeof answer !== "string" || answer.trim().length === 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Answer must be a valid non-empty string" });
  }

  // Validate question_id and user_id
  if (typeof question_id !== "string" || isNaN(user_id)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Invalid question_id or user_id format" });
  }

  try {
    // Validate if the question exists
    const [question] = await dbConnection.query(
      "SELECT * FROM questionTable WHERE question_id = ?",
      [question_id]
    );
    if (question.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Question does not exist" });
    }

    // Validate if the user exists
    const [user] = await dbConnection.query(
      "SELECT * FROM userTable WHERE user_id = ?",
      [user_id]
    );
    if (user.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }

    // Insert answer into the database
    const [result] = await dbConnection.query(
      "INSERT INTO answerTable (question_id, user_id, answer, createdAt) VALUES (?, ?, ?, NOW())",
      [question_id, user_id, answer]
    );

    return res.status(StatusCodes.CREATED).json({
      msg: "Answer posted successfully",
      answer_id: result.insertId,
    });
  } catch (error) {
    console.error("Error posting answer:", error.stack);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later!" });
  }
}

module.exports = { getAnswersForQuestion, postAnswer };
