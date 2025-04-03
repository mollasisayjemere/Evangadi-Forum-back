const dbConnection = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");

// Function to get all answers for a specific question
async function getAnswersForQuestion(req, res) {
  const { question_id } = req.params; // Get question_id from the request parameters

  try {
    // Fetch all answers for the given question_id
    const [answers] = await dbConnection.query(
      `SELECT 
    answerTable.*, 
    userTable.user_name
  FROM answerTable
  JOIN userTable ON answerTable.user_id = userTable.user_id
  WHERE answerTable.question_id = ?
  ORDER BY answerTable.createdAt DESC`,
      [question_id]
    );

    // If no answers found, return a 404 response
    if (answers.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "No answers found for this question" });
    }

    // Return the answers for the question
    return res.status(StatusCodes.OK).json({ answers });
  } catch (error) {
    console.error("Error fetching answers:", error.stack);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later!" });
  }
}

async function postAnswer(req, res) {
  const { user_id, answer } = req.body;
  const { question_id } = req.params;

  // Input validation
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

  try {
    // Check if the question exists
    const [question] = await dbConnection.query(
      "SELECT * FROM questionTable WHERE question_id = ?",
      [question_id]
    );
    if (question.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Question does not exist" });
    }

    // Check if the user exists
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

// const updateAnswer = async (req, res) => {
//   const { answer_id } = req.params;
//   const { answer } = req.body;
//   const { user_id } = req.user; // From the decoded JWT

//   if (!answer) {
//     return res.status(400).json({ error: "Answer content is required" });
//   }

//   try {
//     // Check if the answer exists and belongs to the logged-in user
//     const result = await pool.query(
//       "SELECT * FROM answers WHERE answer_id = $1",
//       [answer_id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Answer not found" });
//     }

//     const answerToUpdate = result.rows[0];

//     // Check if the logged-in user is the one who posted the answer
//     if (answerToUpdate.user_id !== user_id) {
//       return res
//         .status(403)
//         .json({ error: "You can only edit your own answers" });
//     }

//     // Update the answer in the database
//     const updatedAnswer = await pool.query(
//       "UPDATE answerTable SET answer = ?,  createdAt = NOW() WHERE answer_id = ?",
//       [answer, answer_id]
//     );

//     res.json({
//       message: "Answer updated successfully",
//       answer: updatedAnswer.rows[0],
//     });
//   } catch (err) {
//     console.error(err);
//     res
//       .status(500)
//       .json({ error: "An error occurred while updating the answer" });
//   }
// };

const updateAnswer = async (req, res) => {
  const { answer_id } = req.params;
  const { answer } = req.body;
  const { user_id } = req.user; // From the decoded JWT

  if (!answer) {
    return res.status(400).json({ error: "Answer content is required" });
  }

  try {
    // Check if the answer exists and belongs to the logged-in user
    const [result] = await dbConnection.query(
      "SELECT * FROM answerTable WHERE answer_id = ?",
      [answer_id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Answer not found" });
    }

    const answerToUpdate = result[0];

    // Check if the logged-in user is the one who posted the answer
    if (answerToUpdate.user_id !== user_id) {
      return res
        .status(403)
        .json({ error: "You can only edit your own answers" });
    }

    // Update the answer in the database
    const [updatedAnswer] = await dbConnection.query(
      "UPDATE answerTable SET answer = ?,  createdAt = NOW() WHERE answer_id = ?",
      [answer, answer_id]
    );

    res.json({
      message: "Answer updated successfully",
      answer: updatedAnswer,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while updating the answer" });
  }
};

async function deleteAnswer(req, res) {
  console.log("Request body:", req.params);
  const { answer_id } = req.params; // Answer ID from URL parameter
  const { user_id } = req.user; // User ID from request body (authenticated user)

  try {
    // Check if the answer exists
    const [answer] = await dbConnection.query(
      "SELECT * FROM answerTable WHERE answer_id = ?",
      [answer_id]
    );
    console.log(answer);
    if (answer.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Answer not found" });
    }

    // Check if the answer belongs to the user
    if (answer[0].user_id !== user_id) {
      return res.status(StatusCodes.FORBIDDEN).json({
        msg: "You are not authorized to delete this answer",
      });
    }

    // Delete the answer
    await dbConnection.query("DELETE FROM answerTable WHERE answer_id = ?", [
      answer_id,
    ]);

    return res
      .status(StatusCodes.OK)
      .json({ msg: "Answer deleted successfully" });
  } catch (error) {
    console.error("Error deleting answer:", error.stack);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later!" });
  }
}

// async function getSingleAnswerById(req, res) {
//   const { answer_id } = req.params; // Get answer_id from the request parameters
//   const { user_id } = req.user; // Get answer_id from the request parameters

//   try {
//     // Fetch the answer for the given answer_id
//     const [answer] = await dbConnection.query(
//       `SELECT
//         answerTable.*,
//         userTable.user_name
//       FROM answerTable
//       JOIN userTable ON answerTable.user_id = userTable.user_id
//       WHERE answerTable.answer_id = ?`,
//       [answer_id]
//     );

//     // If the answer is not found, return a 404 response
//     if (answer.length === 0) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ msg: "Answer not found" });
//     }
// console.log(answer)
//     // Return the found answer
//     return res.status(StatusCodes.OK).json({ answer: answer[0] });
//   } catch (error) {
//     console.error("Error fetching answer:", error.stack);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ msg: "Something went wrong, try again later!" });
//   }
// }

// Function to get a single answer by ID
async function getSingleAnswerById(req, res) {
  const { answer_id } = req.params; 
  console.log("Received answer_id from URL:", answer_id); // DEBUGGING

  try {
    const [results] = await dbConnection.query(
      `SELECT answerTable.*, userTable.user_name 
      FROM answerTable
      JOIN userTable ON answerTable.user_id = userTable.user_id
      WHERE answerTable.answer_id = ?`,
      [answer_id]
    );

    console.log("Database query result:", results); // DEBUGGING

    if (results.length === 0) {
      console.log("No answer found for ID:", answer_id); // DEBUGGING
      return res.status(404).json({ msg: "No answers found for this answer_id" });
    }

    return res.status(200).json({ answer: results[0] });
  } catch (error) {
    console.error("Database error:", error.stack); // DEBUGGING
    return res.status(500).json({ msg: "Something went wrong!" });
  }
}

// async function getSingleAnswerById(req, res) {
//   const { answer_id } = req.params; // Get answer_id from the request parameters
//   console.log("Received Answer ID from URL:", answer_id); // Log the received answer_id

//   try {
//     // Fetch the answer for the given answer_id
//     const answers = await dbConnection.query(
//       `SELECT 
//         answerTable.*, 
//         userTable.user_name 
//       FROM answerTable
//       JOIN userTable ON answerTable.user_id = userTable.user_id
//       WHERE answerTable.answer_id = ?`,
//       [answer_id]
//     );

//     console.log("Database Results:", answers); // Log the results from the database

//     // If no answer is found
//     if (answers.length === 0) {
//       return res
//         .status(StatusCodes.NOT_FOUND)
//         .json({ msg: "No answers found for this question" });
//     }

//     // Return the first found answer
//     return res.status(StatusCodes.OK).json({ answer: answers[0] });
//   } catch (error) {
//     console.error("Error fetching answer:", error.stack);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ msg: "Something went wrong, try again later!" });
//   }
// }

module.exports = {
  getAnswersForQuestion,
  postAnswer,
  deleteAnswer,
  updateAnswer,
  getSingleAnswerById,
};
