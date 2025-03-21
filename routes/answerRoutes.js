const express = require("express");
const {
  getAnswersForQuestion,
  postAnswer,
} = require("../controller/answerController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to get answers for a specific question by question_id
// ===============================
router.get("/answer/:question_id", authMiddleware, getAnswersForQuestion);

// route to post answers for a specific question
router.post("/answer", authMiddleware, postAnswer);

module.exports = router;
