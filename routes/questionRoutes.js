const express = require("express");
const router = express.Router();
const {
  getAllQuestions,
  getQuestionById,
  postQuestion,
} = require("./controller/questionController");

// Route to get all questions
router.get("/question", getAllQuestions);

// Route to get a specific question by ID
router.get("/:question_id", getQuestionById);

// Route to post a new question
router.post("/question", postQuestion);

module.exports = router;
