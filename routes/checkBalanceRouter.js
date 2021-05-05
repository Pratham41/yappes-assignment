import express from 'express';
import mysql from 'mysql';
const router = express.Router();
import dbConnection from '../config/db.js';

router.post('/balance/:account_no', (req, res) => {
  var temp = []; // temporary array

  // getting account number from customer table

  const checkAccountQuery = `SELECT account_no from customer`;
  dbConnection.query(checkAccountQuery, (err, rows) => {
    if (err) console.log(err);
    else {
      rows = JSON.stringify(rows);

      rows = JSON.parse(rows);
    }
    temp = rows;

    // checking account number is exist or not

    if (temp.find((x) => x.account_no == req.params.account_no)) {
      // checking current balance

      const checkBalanceQuery = `SELECT SUM(deposite) - SUM(withdraw) as Balance FROM transaction WHERE account_no=${req.params.account_no}`;
      dbConnection.query(checkBalanceQuery, (err, result) => {
        if (err) console.log(err);
        else {
          res.send(result);
        }
      });
    } else {
      res.send({
        status: 'FAIL',
        message: 'Please Enter Correct Account Number',
      });
    }
  });
});
export default router;
