# twitter-api-v2-user-oauth-example

This project shows you how to make a simple 3-legged OAuth flow, with both PIN code and callback support.

## Requirements

### Packages

Install all packages of project, configure .env with required properties, then start TypeScript compiler.

```bash
npm i
cp .example.env .env
# ...configure .env with consumer keys
# then start the server
npm run start
```

### Twitter app config

- Copy `.example.env` to `.env` file
- Add your consumer key + consumer secret to `.env` file
- Ensure `http://localhost:5000/callback` is present in allowed callback URLs, inside your Twitter application settings (in developer portal).

## Testing the app

Navigate to `http://localhost:5000` to test **callback-based flow**.

Navigate to `http://localhost:5000/pin-flow` to test **PIN-based flow**.

## How it works

### Callback flow

1) It generate a authentification link (`routes/callback.ts`, `router.get('/')`) that renders into `views/index.ejs`.
2) User clicks link, and is redirected to `routes/callback.ts`, `router.get('/callback')` route.
3) Route use stored tokens into session to generate definitive access token, then renders `views/callback.ejs` with access tokens data.

### PIN flow

1) It generate a authentification link (`routes/pin.ts`, `router.get('/pin-flow')`) that renders into `views/index.ejs`.
2) User clicks link, opening the auth invite in a new tab, that shows a PIN code when acceptation is made.
3) User enter PIN manually into appeared input, then triggers `routes/pin.ts`, `router.get('/validate-pin')` route on button click.
Information about login is printed on screen.
