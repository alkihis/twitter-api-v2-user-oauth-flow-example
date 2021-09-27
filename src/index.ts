import express, { NextFunction, Request, Response } from 'express';
import TwitterApi from 'twitter-api-v2';
import session from 'express-session';
import CONFIG, { TOKENS } from './config';
import { asyncWrapOrError } from './utils';

// -- Startup --

declare module 'express-session' {
  interface SessionData {
    oauthToken?: string;
    oauthSecret?: string;
  }
}

// Create express app + client used to generate links
const requestClient = new TwitterApi({ ...TOKENS });
const app = express();

app.use(session({
  secret: 'twitter-api-v2-test',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

// Just configure the render engin
app.set('view engine', 'ejs');

// -- FLOW 1: --
// -- Callback flow --

// Serve HTML index page with callback link
app.get('/', asyncWrapOrError(async (req, res) => {
  const link = await requestClient.generateAuthLink(`http://localhost:${CONFIG.PORT}/callback`);
  // Save token secret to use it after callback
  req.session.oauthToken = link.oauth_token;
  req.session.oauthSecret = link.oauth_token_secret;

  res.render('index', { authLink: link.url, authMode: 'callback' });
}));

// Read data from Twitter callback
app.get('/callback', asyncWrapOrError(async (req, res) => {
  // Invalid request
  if (!req.query.oauth_token || !req.query.oauth_verifier) {
    res.status(400).render('error', { error: 'Bad request, or you denied application access. Please renew your request.' });
    return;
  }

  const token = req.query.oauth_token as string;
  const verifier = req.query.oauth_verifier as string;
  const savedToken = req.session.oauthToken;
  const savedSecret = req.session.oauthSecret;

  if (!savedToken || !savedSecret || savedToken !== token) {
    res.status(400).render('error', { error: 'OAuth token is not known or invalid. Your request may have expire. Please renew the auth process.' });
    return;
  }

  // Build a temporary client to get access token
  const tempClient = new TwitterApi({ ...TOKENS, accessToken: token, accessSecret: savedSecret });

  // Ask for definitive access token
  const { accessToken, accessSecret, screenName, userId } = await tempClient.login(verifier);
  // You can store & use accessToken + accessSecret to create a new client and make API calls!

  res.render('callback', { accessToken, accessSecret, screenName, userId });
}));

// -- FLOW 2: --
// -- PIN flow --

// Serve HTML index page with link with PIN usage
app.get('/pin-flow', asyncWrapOrError(async (req, res) => {
  const link = await requestClient.generateAuthLink('oob');
  // Save token secret to use it after callback
  req.session.oauthToken = link.oauth_token;
  req.session.oauthSecret = link.oauth_token_secret;

  res.render('index', { authLink: link.url, authMode: 'pin' });
}));

app.post('/validate-pin', express.json(), asyncWrapOrError(async (req, res) => {
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

// -- MISC --

// Error handler
app.use((err: any, _: Request, res: Response, __: NextFunction) => {
  console.error(err);
  res.status(500).render('error');
});

// Start server
app.listen(Number(CONFIG.PORT), () => {
  console.log(`App is listening on port ${CONFIG.PORT}.`);
});
