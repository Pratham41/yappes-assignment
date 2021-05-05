import mysql from 'mysql';
import { HOST, USER, PASSWORD, DATABASE } from '../config/credentials.js';

const dbConnection = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
  multipleStatements: true,
});
dbConnection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected to the database');
});

export default dbConnection;
