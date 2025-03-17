const mysql2 = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const dbConnection = mysql2.createPool({
  user: process.env.USER,
  database: process.env.DATABASE,
  host: "localhost",
  password: process.env.PASSWORD,
  connectionLimit: 10,
  //   socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
});
module.exports = dbConnection.promise();
