import express from 'express';
import dbConnection from '../config/db.js';
const router = express.Router();

router.post('/deposite/:account_no/:amount', (req, res) => {
  const account_no = req.params.account_no;
  var deposite = req.params.amount;
  var withdraw = 0;
  var timestamp = new Date(); // capturing date
  var temp = [];

  var avl_balance = deposite - withdraw;

  // getting account number from customer table

  dbConnection.query('SELECT account_no from customer', (err, rows) => {
    if (err) console.log(err);
    else {
      rows = JSON.stringify(rows);
      rows = JSON.parse(rows);
    }
    temp = rows;

    // checking amount

    if (deposite < 1) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'please enter amount greater than 1',
      });
    }

    // checking account number is exist or not

    if (temp.find((x) => x.account_no == account_no)) {
      // getting one day deposite

      dbConnection.query(
        `SELECT SUM(deposite) AS deposite FROM transaction
            WHERE   timestamp >= CURDATE() - INTERVAL 1 DAY
            AND account_no='${account_no}'`,
        (err, rows) => {
          if (err) console.log(err);
          else {
            rows = JSON.stringify(rows);

            rows = JSON.parse(rows);
            console.log(rows);

            // checking one day deposite limit

            if (rows[0].deposite < 50000) {
              // inserting data in transaction table
              dbConnection.query(
                'INSERT INTO transaction(account_no, deposite, withdraw, avl_balance, timestamp) VALUES(?,?,?,?,?)',
                [account_no, deposite, withdraw, avl_balance, timestamp],
                (err, result) => {
                  if (err) console.log(err);
                  else {
                    // getting deposite amount
                    dbConnection.query(
                      `SELECT SUM(deposite) as deposite FROM transaction WHERE account_no=${account_no}`,
                      (err, rows) => {
                        if (err) console.log(err);
                        else {
                          rows = JSON.stringify(rows);

                          rows = JSON.parse(rows);

                          res.status(200).json({
                            status: 'SUCCESS',
                            message: 'Deposited successful.',
                            balance: `Your current balance is:${rows[0].deposite}`,
                          });
                        }
                      }
                    );
                  }
                }
              );
            } else {
              res.status(400).json({
                status: 'FAIL',
                message: 'Limit Exceed',
              });
            }
          }
        }
      );
    } else {
      res.status(400).json({
        status: 'FAIL',
        message: 'Please enter valid account number',
      });
    }
  });
});

export default router;
