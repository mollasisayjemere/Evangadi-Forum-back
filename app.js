const express = require("express");
const cors = require("cors");
const dbConnection=require("./db/dbConfig")

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

    ;
// Endpoint to create tables
app.get("/create-table", async (req, res) => {
  // SQL query to create the Users table
  let user_table = `CREATE TABLE IF NOT EXISTS userTable (
    user_id INT(30) AUTO_INCREMENT,
    user_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id)
  )`;
  // SQL query to create the Questions table
  let question_table = `CREATE TABLE IF NOT EXISTS questionTable (
    id INT(30) NOT NULL AUTO_INCREMENT,
    question_id VARCHAR(120) NOT NULL UNIQUE,
    user_id INT(30) NOT NULL,
    title VARCHAR(70) NOT NULL,
    question_description VARCHAR(300) NOT NULL,
    tag VARCHAR(40),
    PRIMARY KEY (id, question_id),
    FOREIGN KEY (user_id) REFERENCES userTable(user_id)
  )`;
  // SQL query to create the Answers table
  let answer_table = `CREATE TABLE IF NOT EXISTS answerTable (
    answer_id INT(30) NOT NULL AUTO_INCREMENT,
    user_id INT(30) NOT NULL,
    question_id VARCHAR(120) NOT NULL,
    answer VARCHAR(300) NOT NULL,
    PRIMARY KEY (answer_id),
    FOREIGN KEY (user_id) REFERENCES userTable(user_id),
    FOREIGN KEY (question_id) REFERENCES questionTable(question_id)
  )`;
  // Execute each query and log whether the table was created successfully
  try {
    // Execute each query sequentially using promises
    await dbConnection.execute(user_table);
    console.log("Users Table created successfully");
    await dbConnection.execute(question_table);
    console.log("Questions Table created successfully");
    await dbConnection.execute(answer_table);
    console.log("Answers Table created successfully");
    res.status(200).send("Tables created successfully");
  } catch (err) {
    console.log("Error creating tables:", err.message);
    res.status(500).send("Error creating tables");
  }
})

// PORT
const PORT = 2224;
const start = async () => {
  try {
    const result = await dbConnection.execute("select 'test' ");
    app.listen(PORT);
    console.log("Database connected successfully");
    console.log(`Listening to PORT: ${PORT}`);
  } catch (error) {
    console.log(error.message);
  }
};
start();