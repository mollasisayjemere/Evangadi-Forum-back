const express = require("express");
const cors = require("cors");
const dbConnection = require("./db/dbConfig");
const createTables = require("./db/dbSchema");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  res.send("Welcome");
});

// User route middleware file
const userRoutes = require("./routes/userRoutes");

// Questions route middleware file
const questionRoutes = require("./routes/questionRoutes");

// Answers route middleware file
const answerRoutes = require("./routes/answerRoutes");

// users routes middleware
app.use("/api/users", userRoutes);

// questions routes middleware
app.use("/api", questionRoutes);

// answers routes middleware
app.use("/api", answerRoutes);

// Create tables with an endpoint
app.get("/create-table", createTables);

// PORT
const PORT = 3456;
// const PORT = process.env.MYSQLPORT;
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
