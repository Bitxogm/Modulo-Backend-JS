import express from 'express';

const app = express();

app.get('/', (req, res, next) => {
  res.send('Hello Bitxo!')
});

export default app;