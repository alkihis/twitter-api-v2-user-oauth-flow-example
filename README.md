# twitter-api-v2-user-oauth-example

This project shows you how to make a simple 3-legged OAuth flow, with both PIN code and callback support.

## Requirements

### Packages

Install all packages of project, then start TypeScript compiler.

```bash
npm i
npm run start
```

### Twitter app config

- Copy `.example.env` to `.env` file
- Add your consumer key + consumer secret to `.env` file
- Ensure `http://localhost:5000/callback` is present in allowed callback URLs, inside your used Twitter application settings.

## Testing the app

Navigate to `http://localhost:5000` to test **callback-based flow**.

Navigate to `http://localhost:5000/pin-flow` to test **PIN-based flow**.
