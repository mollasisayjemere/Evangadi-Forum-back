const express = require("express");
const {
  getAnswersForQuestion
} = require("../controller/answerController");

const router = express.Router();

// Route to get answers for a specific question by question_id
// ===============================
router.get("/answer/:question_id", getAnswersForQuestion); 

module.exports = router
