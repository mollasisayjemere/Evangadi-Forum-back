const express = require("express");
const router = express.Router();
const {
  getAllQuestions,
  getQuestionById,
  postQuestion,
} = require("../controller/questionController");
const authMiddleware = require("../middleware/authMiddleware");

// Route to get all questions
router.get("/questions", getAllQuestions);

// Route to get a specific question by ID
router.get("/:question_id", getQuestionById);

// Route to post a new question
router.post("/post-question", authMiddleware, postQuestion);

module.exports = router;
