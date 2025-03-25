const express = require("express");
const {
  getAnswersForQuestion,
  postAnswer,
  deleteAnswer,
  updateAnswer,
} = require("../controller/answerController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to get answers for a specific question by question_id
router.get("/answers/:question_id", authMiddleware, getAnswersForQuestion);

// Route to post answers for a specific question
router.post("/answer/:question_id", authMiddleware, postAnswer);

// Route to delete a specific answer posted by the user
router.post("/answer/delete/:answer_id", authMiddleware, deleteAnswer);

//
router.put("/answers/:answer_id", authMiddleware, updateAnswer);

// router.delete('/answers/:answer_id', authMiddleware, )

module.exports = router;
