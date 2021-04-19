import * as receiver from './receiver';
import { RequestHandler } from 'express';
import requestMiddleware from '../middleware/request-middleware';

const sendFake: RequestHandler = async (req, res) => {
  res.sendStatus(200);
  receiver.receiveMail();
};

export default requestMiddleware(sendFake);
