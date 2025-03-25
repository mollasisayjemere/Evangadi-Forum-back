const { StatusCodes } = require("http-status-codes");
const dbConnection = require("./dbConfig");

const createTables = async (req, res) => {
  // SQL query to create the Users table
  let user_table = `CREATE TABLE IF NOT EXISTS userTable (
    user_id INT(30) AUTO_INCREMENT,
    user_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
  )`;
  // SQL query to create the Questions table
  let question_table = `CREATE TABLE IF NOT EXISTS questionTable (
    question_id VARCHAR(120) NOT NULL,
    user_id INT(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    question_description VARCHAR(300) NOT NULL,
    tag VARCHAR(40),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (question_id),
    FOREIGN KEY (user_id) REFERENCES userTable(user_id) ON DELETE CASCADE
  )`;

  // SQL query to create the Answers table
  let answer_table = `CREATE TABLE IF NOT EXISTS answerTable (
    answer_id INT(30) NOT NULL AUTO_INCREMENT,
    user_id INT(30) NOT NULL,
    question_id VARCHAR(120) NOT NULL,
    answer VARCHAR(300) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (answer_id),
    FOREIGN KEY (user_id) REFERENCES userTable(user_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questionTable(question_id) ON DELETE CASCADE
  )`;

  // Execute each query and log whether the table was created successfully
  try {
    // Execute each query sequentially using promises
    await dbConnection.query(user_table);
    console.log("Users Table created successfully");

    await dbConnection.query(question_table);
    console.log("Questions Table created successfully");

    await dbConnection.query(answer_table);
    console.log("Answers Table created successfully");

    res.status(StatusCodes.OK).json({ msg: "Tables created successfully" });
  } catch (err) {
    console.log("Error creating tables:", err.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Error creating tables" });
  }
};

module.exports = createTables;
