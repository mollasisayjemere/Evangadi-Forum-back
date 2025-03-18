const mysql2 = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const dbConnection = mysql2.createPool({
  user: "evangadi_admin",
  database: "evangadi_forum",
  host: "localhost",
  password: "123456789",
  connectionLimit: 10,
  //   socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
});
module.exports = dbConnection.promise();
