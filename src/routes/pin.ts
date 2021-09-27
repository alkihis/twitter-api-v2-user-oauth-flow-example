import express, { Router } from 'express';
import { TwitterApi } from 'twitter-api-v2';
import { requestClient, TOKENS } from '../config';
import { asyncWrapOrError } from '../utils';

export const pinRouter = Router();

// -- FLOW 2: --
// -- PIN flow --

// Serve HTML index page with link with PIN usage
pinRouter.get('/pin-flow', asyncWrapOrError(async (req, res) => {
  const link = await requestClient.generateAuthLink('oob');
  // Save token secret to use it after callback
  req.session.oauthToken = link.oauth_token;
  req.session.oauthSecret = link.oauth_token_secret;

  res.render('index', { authLink: link.url, authMode: 'pin' });
}));

pinRouter.post('/validate-pin', express.json(), asyncWrapOrError(async (req, res) => {
  const { pin } = req.body;

  if (!pin) {
    res.status(400).json({ message: 'Invalid PIN.' });
    return;
  }

  const savedToken = req.session.oauthToken;
  const savedSecret = req.session.oauthSecret;

  if (!savedToken || !savedSecret) {
    res.status(400).json({ message: 'Tokens are missing from session. Please retry the auth flow.' });
    return;
  }

  // Build a temporary client to get access token
  const tempClient = new TwitterApi({ ...TOKENS, accessToken: savedToken, accessSecret: savedSecret });

  // Ask for definitive access token with PIN code
  try {
    const { accessToken, accessSecret, screenName, userId } = await tempClient.login(pin);
    // You can store & use accessToken + accessSecret to create a new client and make API calls!

    res.json({ accessToken, accessSecret, screenName, userId });
  } catch (e) {
    res.status(400).json({ message: 'Bad PIN code. Please check your input.' });
  }
}));

export default pinRouter;
