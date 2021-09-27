import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import CONFIG from './config';
import callbackRouter from './routes/callback';
import pinRouter from './routes/pin';

// -- STARTUP --

declare module 'express-session' {
  interface SessionData {
    oauthToken?: string;
    oauthSecret?: string;
  }
}

// Create express app
const app = express();

// Configure session - needed to store secret token between requests
app.use(session({
  secret: 'twitter-api-v2-test',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

// Just configure the render engine
app.set('view engine', 'ejs');

// -- ROUTES --

app.use(callbackRouter);
app.use(pinRouter);

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
