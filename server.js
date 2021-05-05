import express from 'express';
import dotenv from 'dotenv';

import checkBalanceRouter from './routes/checkBalanceRouter.js';
import depositeRouter from './routes/depositeRouter.js';
import withdrawRouter from './routes/withdrawRouter.js';
const app = express();
dotenv.config();

app.use(express.json());

app.use('/bank', checkBalanceRouter);
app.use('/bank', depositeRouter);
app.use('/bank', withdrawRouter);

app.listen(process.env.PORT || 6000, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
