import { initializePaddle } from '@paddle/paddle-js';

const token = process.env.PADDLE_CLIENT_SIDE_TOKEN;

if (!token) {
  throw new Error("Missing PADDLE_CLIENT_SIDE_TOKEN environment variable.");
}

const paddle = await initializePaddle({
  environment: 'sandbox',
  token: token,
});