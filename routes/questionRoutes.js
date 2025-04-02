const express = require("express");
const router = express.Router();
const {
  getAllQuestions,
  getQuestionById,
  postQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controller/questionController");
const authMiddleware = require("../middleware/authMiddleware");

// Route to get all questions
router.get("/questions/all-questions", authMiddleware, getAllQuestions);

// Route to get a specific question by ID
router.get("/questions/:question_id", authMiddleware, getQuestionById);

// Route to update a specific question
router.put("/questions/update/:question_id", authMiddleware, updateQuestion);

// Route to delete a specific question by ID
router.delete("/questions/delete/:question_id", authMiddleware, deleteQuestion);

// Route to post a new question
router.post("/questions/post-question", authMiddleware, postQuestion);

module.exports = router;
