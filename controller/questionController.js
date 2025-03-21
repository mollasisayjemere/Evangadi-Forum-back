const dbConnection = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");

// Function to get all questions
async function getAllQuestions(req, res) {
  try {
    // Fetch all questions from the database
    const [questions] = await dbConnection.query(
      "SELECT * FROM questionTable ORDER BY createdAt DESC"
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

// Function to get a single question by ID
async function getQuestionById(req, res) {
  const { question_id } = req.params; // Match the table's column name

  try {
    // Fetch the question by ID
    const [questions] = await dbConnection.query(
      "SELECT * FROM questionTable WHERE question_id = ?",
      [question_id]
    );

    if (questions.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Question not found" });
    }

    return res.status(StatusCodes.OK).json({ question: questions[0] });
  } catch (error) {
    console.error("Error fetching question:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later!" });
  }
}

// Function to post a new question
async function postQuestion(req, res) {
  const { title, question_description, user_id, tag } = req.body;

  if (!title || !question_description || !user_id) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide title, description, and user_id" });
  }

  try {
    const question_id = uuidv4();
    // Insert the new question into the database
    const [result] = await dbConnection.query(
      "INSERT INTO questionTable (question_id, user_id, title, question_description, tag) VALUES (?, ?, ?, ?, ?)",
      [question_id, user_id, title, question_description, tag]
    );

    return res.status(StatusCodes.CREATED).json({
      msg: "Question created successfully",
      question_id: result.insertId, // Using the generated question_id
    });
  } catch (error) {
    console.error("Error posting question:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later!" });
  }
}

module.exports = { getAllQuestions, getQuestionById, postQuestion };
