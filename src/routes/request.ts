import express from 'express';

const requestRouter = express.Router();

requestRouter.post('/sendConnectionRequest', (req, res) => {
  res.send('Request Send');
});

export default requestRouter;
