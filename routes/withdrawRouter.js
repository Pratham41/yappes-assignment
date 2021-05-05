import express from 'express';
import dbConnection from '../config/db.js';
const router = express.Router();

router.post('/withdraw/:account_no/:amount', (req, res) => {
  const account_no = req.params.account_no;
  var amount = req.params.amount;
  var deposite = 0;
  var timestamp = new Date();
  var myResult = [];
  var avl_balance = 0;
  var updatedBalance = 0;

  // getting account number

  dbConnection.query('SELECT account_no from customer', (err, results) => {
    if (err) console.log(err);
    else {
      results = JSON.stringify(results);
      results = JSON.parse(results);
    }
    myResult = results;

    // checking amount
    if (amount < 1) {
      return res.status(400).json({
        status: 'FAIL',
        message: 'Enter Amount Greater than 1',
      });
    }
    // checking account number
    if (myResult.find((x) => x.account_no == account_no)) {
      // checking balance

      dbConnection.query(
        `SELECT SUM(deposite) - SUM(withdraw) deposite FROM transaction WHERE account_no='${account_no}'`,
        (err, results) => {
          if (err) console.log(err);
          else {
            results = JSON.stringify(results);
            results = JSON.parse(results);

            avl_balance = results;
            updatedBalance = avl_balance[0].deposite - amount;
            // comparing balance
            if (results[0].deposite >= amount) {
              // checking one day limit
              dbConnection.query(
                `SELECT SUM(withdraw) AS withdraw FROM transaction
                            WHERE   timestamp >= CURDATE() - INTERVAL 1 DAY
                            AND account_no='${account_no}'`,
                (err, results) => {
                  if (err) console.log(err);
                  else {
                    results = JSON.stringify(results);
                    results = JSON.parse(results);

                    // checking limit exceed or not
                    if (results[0].withdraw < 10000) {
                      // inserting in transaction table

                      dbConnection.query(
                        'INSERT INTO transaction(account_no, deposite, withdraw, avl_balance, timestamp) VALUES(?,?,?,?,?)',
                        [
                          account_no,
                          deposite,
                          amount,
                          updatedBalance,
                          timestamp,
                        ],
                        (err, result) => {
                          if (err) console.log(err);
                          else {
                            // getting withdraw
                            dbConnection.query(
                              `SELECT SUM(deposite) - sum(withdraw) as withdraw FROM transaction WHERE account_no='${account_no}'`,
                              (err, results) => {
                                if (err) console.log(err);
                                else {
                                  results = JSON.stringify(results);
                                  results = JSON.parse(results);
                                  res.status(200).json({
                                    status: 'SUCCESS',
                                    message: 'Withdraw successful.',
                                    balance: `Your current balance is:${results[0].withdraw}`,
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
                message: 'You have insufficient balance',
              });
            }
          }
        }
      );
    } else {
      res.status(400).json({
        status: 'FAILD',
        message: 'Please enter valid account number',
      });
    }
  });
});

export default router;
