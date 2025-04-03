const express = require("express");
const {
  getAnswersForQuestion,
  postAnswer,
  deleteAnswer,
  updateAnswer,
  getSingleAnswerById,
} = require("../controller/answerController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to get answers for a specific question by question_id
router.get("/answers/:question_id", authMiddleware, getAnswersForQuestion);

// Route to post answers for a specific question
router.post("/answer/:question_id", authMiddleware, postAnswer);

// Route to delete a specific answer posted by the user
router.delete("/answer/delete/:answer_id", authMiddleware, deleteAnswer);

router.put("/answer/update/:answer_id", authMiddleware, updateAnswer);

router.get('/answer/:answer_id', authMiddleware, getSingleAnswerById)

module.exports = router;
