const express = require("express");
const router = express.Router();
const { getAllQuestions } = require("./controller/questionController");

router.get("/question", getAllQuestions);
module.exports = router;