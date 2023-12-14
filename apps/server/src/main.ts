import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import * as path from 'path';
import { sendNotification, setVapidDetails } from 'web-push';

config();

interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

setVapidDetails(
  'mailto:awaissaeed530@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

let subscription: PushSubscription;

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app
  .get('/api/health', (req, res) => {
    res.send({ status: 'OK' });
  })
  .post('/api/subscription', (req, res) => {
    subscription = req.body;
    console.log('Subscription saved', req.body);
    res.send({ success: true });
  })
  .post('/api/send', (req, res) => {
    try {
      sendNotification(subscription, JSON.stringify(req.body));
      console.log('Message sent', req.body);
      res.send({ success: true });
    } catch (e) {
      res.status(400).send(e.message);
    }
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
